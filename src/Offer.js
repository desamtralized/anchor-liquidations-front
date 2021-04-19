import React from 'react';
import { LCDClient, MsgInstantiateContract, Extension, Msg, Coin, Coins, Denom, Dec } from '@terra-money/terra.js';
import { withRouter } from "react-router-dom";
import { formatAddress, formatAmount } from './utils';

import flagCO from './assets/co.svg';
import flagUST from './assets/ic_ust.svg';
import icArrowDown from './assets/ic_arrow.svg';

import { OFFERS_CONTRACT, USD_COP_API, TRADE_CONTRACT_CODE_ID } from './constants';

const terra = new LCDClient({
  URL: 'https://tequila-lcd.terra.dev',
  chainID: 'tequila-0004',
});

const ext = new Extension();

class Offer extends React.Component {

  constructor(props) {
    super(props);

    this.handleCopAmountChange = this.handleCopAmountChange.bind(this)
    this.handleUstAmountChange = this.handleUstAmountChange.bind(this)
    this.openTrade = this.openTrade.bind(this)
    this.getTxResult = this.getTxResult.bind(this)

    this.state = {
      offer: {
        owner: '',
        type: 'buy',
        fiat_currency: 'cop',
        min_amount: 0,
        max_amount: 0
      },
      conversionRate: 0,
      ustAmount: 0, 
      copAmount: 0,
      tradingFee: 0,
      finalAmount: 0,
      valid: false,
      loading: false
    }
  }

  componentDidMount() {
    let offerId = this.props.match.params.id;
    let query = {"load_offer": {"id": parseInt(offerId)}};
    terra.wasm.contractQuery(OFFERS_CONTRACT, query).then(offer => {
      this.setState({offer})
    })
    fetch(USD_COP_API).then(res => {
      return res.json()
    }).then(rate => {
      this.setState({conversionRate: parseInt(rate.quotes['USDCOP'])})
    })
  }

  handleCopAmountChange(evt) {
    let copAmount = evt.target.value
    let ustAmount = copAmount / this.state.conversionRate
    let tradingFee = copAmount * 0.01
    let finalAmount = ustAmount * 0.99

    let valid = ustAmount >= this.state.offer.min_amount && ustAmount <= this.state.offer.max_amount
    this.setState({copAmount, ustAmount, tradingFee, finalAmount, valid})
  }

  handleUstAmountChange(evt) {
    let ustAmount = evt.target.value
    let copAmount = ustAmount * this.state.conversionRate
    let tradingFee = copAmount * 0.01
    let finalAmount = ustAmount * 0.99

    let valid = ustAmount >= this.state.offer.min_amount && ustAmount <= this.state.offer.max_amount
    this.setState({copAmount, ustAmount, tradingFee, finalAmount, valid})
  }

  async openTrade(evt) {
    const walletAddress = localStorage.getItem('walletAddress')
    evt.preventDefault()
    const initMsg = {
      offer: this.state.offer.id,
      amount: parseInt(this.state.ustAmount)
    }
    const ustAmount = this.state.ustAmount * 1000000
    const coin = Coin.fromData({denom: Denom.USD, amount: ustAmount})
    const coins = new Coins([coin])
    const createTradeMsg = new MsgInstantiateContract(walletAddress, TRADE_CONTRACT_CODE_ID, 
      initMsg, coins)

    this.setState({loading: true})
    ext.once('onPost', res => {
      if (res.success) {
        setTimeout(() => {
          this.getTxResult(res.result.txhash)
        }, 2000)
      } else {
        alert('Error')
      }
    })
    ext.post({
      msgs: [createTradeMsg]
    })
  }

  getTxResult(txHash, attempts = 0) {
    terra.tx.txInfo(txHash).then(res => {
      console.log('txInfo', res)
      let tradeAddress = res.logs[0].events[0].attributes[2].value
      this.setState({loading: false})
      this.props.history.push(`/trade/${tradeAddress}`)
    }).catch(err => {
      attempts++;
      if (attempts < 5) {
        setTimeout(()=>{
          this.getTxResult(txHash, attempts)
        }, 2000)
      }
      console.log('failed to load trasaction info', err)
    })
  }

  render() {
    return (
      <section class="create-trade">

        <h1>You are buying from <span>{formatAddress(this.state.offer.owner)}</span></h1>
        <h2>1 UST = COP$ {formatAmount(this.state.conversionRate, false)}</h2>
        <h2>{`Min $${formatAmount(this.state.offer.min_amount)} - Max $${formatAmount(this.state.offer.max_amount)}`}</h2>

          <div className="input-wrap">
            <img src={flagUST} alt=""/>
            <span>UST</span>
            <input type="text" placeholder="" 
              onChange={this.handleUstAmountChange}
              value={this.state.ustAmount}/>
          </div>
          <div className="input-wrap">
            <img src={flagCO} alt=""/>
            <span>COP</span>
            <input type="text" placeholder="" 
              onChange={this.handleCopAmountChange}
              value={this.state.copAmount}/>
          </div>

          <img class="icon-separator" src={icArrowDown} alt=""/>

          <div className="receipt">
            <div className="row">
              <p>Trading fee</p>
              <p>{this.state.tradingFee} COP</p>
            </div>
            <div className="row">
              <p>You will get</p>
              <p className="bold">{this.state.finalAmount} UST</p>
            </div>
            <div className="row">
              <p>You will pay</p>
              <p className="bold color">{this.state.copAmount} COP</p>
            </div>
          </div>

          {this.state.loading && <button disabled>opening trade...</button>}
          {!this.state.loading && <button 
            onClick={this.openTrade}
            disabled={!this.state.valid}>open trade</button>}

      </section>
    )
  }
}

export default withRouter(Offer);

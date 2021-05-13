import React from 'react';
import { LCDClient, MsgInstantiateContract, Extension, Msg, Coin, Coins, Denom, Dec, MsgExecuteContract, MsgSend } from '@terra-money/terra.js';
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

class Trade extends React.Component {

  constructor(props) {
    super(props);

    this.fetchTrade = this.fetchTrade.bind(this)
    this.releaseEscrow = this.releaseEscrow.bind(this)
    this.fundEscrow = this.fundEscrow.bind(this)

    this.state = {
      walletAddress: localStorage.getItem('walletAddress'),
      escrowBalance: 0,
      offer: {
        owner: '',
        offer_type: '',
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
      loading: false,
      trade: {
        amount: '',
        state: '',
        sender: '',
        recipient: ''
      }
    }
  }

  componentDidMount() {
    this.fetchTrade();
  }

  fetchTrade() {
    let tradeAddr = this.props.match.params.id;
    fetch(USD_COP_API).then(res => {
      return res.json()
    }).then(rate => {
      this.setState({conversionRate: parseInt(rate.quotes['USDCOP'])})
    })
    terra.auth.accountInfo(tradeAddr)
    let trade;
    let offer;

    terra.wasm.contractQuery(tradeAddr, {"config":{}}).then(res => {
      trade = res
      let query = {"load_offer": {"id": parseInt(trade.offer_id)}};
      return terra.wasm.contractQuery(OFFERS_CONTRACT, query)
    }).then(res => {
      offer = res
      return terra.auth.accountInfo(tradeAddr)
    }).then(res => {
      let escrowBalance = 0
      if (res.coins.denoms().indexOf('uusd') >= 0) {
        escrowBalance = parseInt(res.coins.get('uusd').amount.toString())
      }
      if (escrowBalance >= trade.amount * 1000000) {
        trade.state = 'escrow_funded'
      }
      console.log('escrow balance', escrowBalance)
      console.log('trade amount', trade.amount * 1000000)
      this.setState({offer, trade, escrowBalance, loading: false})
    })
  }

  async releaseEscrow(evt) {
    evt.preventDefault()
    let tradeAddr = this.props.match.params.id;
    const walletAddress = localStorage.getItem('walletAddress')

    const releaseMsg = new MsgExecuteContract(walletAddress, tradeAddr, {release:{}})

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
      msgs: [releaseMsg]
    })
  }

  async fundEscrow(evt) {
    evt.preventDefault()
    let tradeAddr = this.props.match.params.id;
    const walletAddress = localStorage.getItem('walletAddress')

    const ustAmount = this.state.trade.amount * 1000000
    const coin = Coin.fromData({denom: Denom.USD, amount: ustAmount})
    const coins = new Coins([coin])
    const fundEscrowMsg = new MsgSend(walletAddress, tradeAddr, coins)

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
      msgs: [fundEscrowMsg],
      gasAdjustment: 2
    })
  }

  getTxResult(txHash, attempts = 0) {
    terra.tx.txInfo(txHash).then(res => {
      this.fetchTrade()
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
        {this.state.offer.offer_type == 'buy' && 
          <h1>You are selling <img src={flagUST} /> <b>{this.state.trade.amount} UST </b> 
            to <span>{formatAddress(this.state.offer.owner)}</span> for <img src={flagCO} /><b> {this.state.trade.amount * this.state.conversionRate} COP</b>
          </h1>
        }
        {this.state.offer.offer_type == 'sell' && this.state.offer.owner != this.state.walletAddress && 
          <h1>You are buying {this.state.trade.amount} from <span>{formatAddress(this.state.offer.owner)}</span></h1>
        }
        {this.state.offer.offer_type == 'sell' && this.state.offer.owner == this.state.walletAddress && 
          <h1>You are selling {this.state.trade.amount} to <span>{formatAddress(this.state.trade.recipient)}</span></h1>
        }
        <div className="receipt">
          <div className="row">
            <p>Seller puts UST in escrow</p>
            {['escrow_funded', 'closed'].indexOf(this.state.trade.state) >= 0 && 
              <p className="color">Done</p>
            }
            {['escrow_funded', 'closed'].indexOf(this.state.trade.state) == -1 && 
              <p>Waiting</p>
            }
          </div>
          <div className="row">
            <p>Escrow released to buyer</p>
            {this.state.trade.state == 'closed' && 
              <p className="color">Done</p>
            }
            {this.state.trade.state != 'closed' && 
              <p>Waiting</p>
            }
          </div>
        </div>

        {/* Funding Escrow */}
        {this.state.offer.offer_type == 'sell' && !this.state.loading && 
          this.state.trade.state == 'created' && 
          this.state.trade.sender == this.state.walletAddress &&
          <button onClick={this.fundEscrow}>fund escrow</button>
        }
        {this.state.offer.offer_type == 'sell' && this.state.loading && 
          this.state.trade.state == 'created' && 
          this.state.trade.sender == this.state.walletAddress &&
          <button disabled>funding escrow...</button>
        }

        {/* Releasing Escrow */}
        {this.state.offer.offer_type == 'sell' && !this.state.loading && 
          this.state.trade.state == 'escrow_funded' && 
          this.state.trade.sender == this.state.walletAddress &&
          <button onClick={this.releaseEscrow}>release escrow</button>
        }
        {this.state.offer.offer_type == 'sell' && this.state.loading && 
          this.state.trade.state == 'escrow_funded' && 
          this.state.trade.sender == this.state.walletAddress &&
          <button disabled>releasing escrow...</button>
        }

        {this.state.offer.offer_type == 'buy' && !this.state.loading && 
          this.state.trade.state != 'closed' && 
          this.state.trade.sender != this.state.walletAddress &&
          <h2>Waiting for escrow</h2>
        }

        {this.state.trade.state == 'expired' &&
          <h2>Trade expired</h2>
        }
        {this.state.trade.state == 'closed' &&
          <h2>Trade successful</h2>
        }
      </section>
    )
  }
}

export default withRouter(Trade);

import React from 'react';
import { LCDClient,  Extension, Msg, Coin, Coins, Denom, Dec, MsgExecuteContract, MsgSend, StdFee } from '@terra-money/terra.js';
import { OFFERS_CONTRACT, LIQUIDATION_CONTRACT, ORACLE } from './constants';

const ext = new Extension();


const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-4',
});

class Offers extends React.Component {

  offerTypeLabels = {"buy": "Sell", "sell": "Buy"}

  constructor(props) {
    super(props);

    this.liquidate = this.liquidate.bind(this);
    this.fetchBid = this.fetchBid.bind(this);
    this.retractBid = this.retractBid.bind(this);
    this.fetchPrice = this.fetchPrice.bind(this);
    this.submitBid = this.submitBid.bind(this);
    this.handleBidAmountChanged = this.handleBidAmountChanged.bind(this);

    this.state = {
        offers: [],
        liquidations: [],
        bid: 0,
        bidAmount: 0,
        price: 0,
    }
  }

  componentDidMount() {
    this.fetchPrice();
    this.fetchBid();
    let orderQuery = {"load_offers": {"fiat_currency": "cop"}};
    fetch("http://157.245.223.82:8080/liquidations.json").then(res => {
      return res.json()
    }).then(liquidations => {
      liquidations.sort((aL, bL) => bL.loanAmount - aL.loanAmount)
      this.setState({liquidations})
    })
    setInterval(() => {
      this.fetchPrice();
    }, 5000)
  }

  fetchPrice() {
    terra.wasm.contractQuery(ORACLE, {"prices":{}}).then(res => {
      let price = parseFloat(res.Ok.prices[0].price);
      this.setState({price})
    });
  }

  submitBid(amount) {
    let submitBidMsg = {
      "submit_bid": {
        "collateral_token": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp",
        "premium_rate": "0.3"
      }
    }
    const ustAmount = amount * 1000000
    const coin = Coin.fromData({denom: Denom.USD, amount: ustAmount})
    const coins = new Coins([coin])

    const walletAddress = localStorage.getItem('walletAddress')
    const releaseMsg = new MsgExecuteContract(walletAddress, 
      LIQUIDATION_CONTRACT, submitBidMsg, coins)

    this.setState({loading: true})
    const obj = new StdFee(1_000_000, { uusd: 200000 })

    ext.once('onPost', res => {
      if (res.success) {
        setTimeout(() => {
          this.getTxResult(res.result.txhash)
        }, 2000)
      } else {
        console.log(res)
        alert('Error')
      }
    })
    ext.post({
      msgs: [releaseMsg],
      gasPrices: obj.gasPrices(),
    })
  }

  retractBid() {
    let retractMsg = {
      "retract_bid": {
        "collateral_token": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
      }
    }
    const walletAddress = localStorage.getItem('walletAddress')
    const releaseMsg = new MsgExecuteContract(walletAddress, 
      LIQUIDATION_CONTRACT, retractMsg)

    this.setState({loading: true})
    const obj = new StdFee(1_000_000, { uusd: 200000 })

    ext.once('onPost', res => {
      if (res.success) {
        setTimeout(() => {
          this.getTxResult(res.result.txhash)
        }, 2000)
      } else {
        console.log(res)
        alert('Error')
      }
    })
    ext.post({
      msgs: [releaseMsg],
      gasPrices: obj.gasPrices(),
    })
  }


  async liquidate(borrower) {
    const walletAddress = localStorage.getItem('walletAddress')
    let overseerContract = "terra1tmnqgvg567ypvsvk6rwsga3srp7e3lg6u0elp8"
    const releaseMsg = new MsgExecuteContract(walletAddress, overseerContract, {
      "liquidate_collateral": {
        "borrower": borrower
      }
    })

    this.setState({loading: true})
    const obj = new StdFee(1_000_000, { uusd: 200000 })

    ext.once('onPost', res => {
      if (res.success) {
        setTimeout(() => {
          this.getTxResult(res.result.txhash, borrower)
        }, 2000)
      } else {
        console.log(res)
        alert('Error')
      }
    })
    ext.post({
      msgs: [releaseMsg],
      gasPrices: obj.gasPrices(),
    })
  }

  getTxResult(txHash, borrower = false, attempts = 0) {
    terra.tx.txInfo(txHash).then(res => {
      if (borrower) {
        localStorage.setItem(borrower, 'true');
      }
      this.setState({loading: false})
      setTimeout(() => {
        this.fetchBid();
      }, 5000)
    }).catch(err => {
      attempts++;
      if (attempts < 10) {
        setTimeout(()=>{
          this.getTxResult(txHash, borrower, attempts)
        }, 2000)
      }
      console.log('failed to load trasaction info', err)
    })
  }

  fetchBid() {
    let bidQuery = {"bid":{
      "collateral_token":"terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp", 
      "bidder":localStorage.getItem('walletAddress')}
    }
    terra.wasm.contractQuery(LIQUIDATION_CONTRACT, bidQuery).then(bid => {
      this.setState({bid: parseInt(bid.amount)/1000000})
    })
    this.fetchPrice();
  }

  handleBidAmountChanged(evt) {
    let bidAmount = evt.target.value
    this.setState({bidAmount})
  }

  render() {
    return (
      <ul class="offers-list">
        <li>
          <h3>1 Luna = {this.state.price.toFixed(2)} UST</h3>
        </li>
        {this.state.bid > 0 &&
          <li>
            <h4>{this.state.bid} UST remaining</h4>
            <button onClick={this.retractBid}>Retract</button>
          </li>
        }
        {this.state.bid === 0 && 
          <li>
            <div className="input-wrap">
              <input type="text" placeholder="" 
                onChange={this.handleBidAmountChanged}
                value={this.state.bidAmount}/>
            </div>
            <h4><input></input></h4>
            <button onClick={() => {this.submitBid(this.state.bidAmount)}}>Submit Bid</button>
          </li>
        }
        {this.state.liquidations.map(l =>
          <li>
            {l.ltv > 1 &&
              <p><b>{l.ltv}</b></p>
            }
            {l.ltv < 1 &&
              <p>{l.ltv}</p>
            }
            <p>{parseInt(l.b.balance)/1000000} bLuna</p>
            <p>{parseInt(l.loanAmount)/1000000} UST</p>
            <p>{((l.loanAmount/l.b.balance)*2).toFixed(2)}</p>
            {!localStorage.getItem(l.b.borrower) &&
              <button onClick={()=> {this.liquidate(l.b.borrower)}}>Liquidate</button>
            }
          </li>
        )}
      </ul>
    )
  }
}

export default Offers;

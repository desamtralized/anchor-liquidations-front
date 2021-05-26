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
    this.fetchLiquidations = this.fetchLiquidations.bind(this);
    this.liquidateAll = this.liquidateAll.bind(this);
    this.clear = this.clear.bind(this);

    this.state = {
        offers: [],
        liquidations: [],
        bid: 0,
        bidAmount: 0,
        price: 0,
        liquidationMsgs: []
    }
  }

  componentDidMount() {
    this.fetchPrice();
    this.fetchBid();

    setInterval(() => {
      this.fetchLiquidations();
    }, 1000)

    setInterval(() => {
      this.fetchPrice();
    }, 1000)
  }

  fetchLiquidations() {
    //fetch("http://157.245.223.82:8080/liquidations.js", {cache: "no-store"}).then(res => {
    fetch('http://159.65.186.180:8080/liquidations.js', {cache: "no-store"}).then(res => {
      return res.json()
    }).then(liquidations => {
      liquidations.sort((aL, bL) => parseInt(bL.borrowedUstAmount) - parseInt(aL.borrowedUstAmount))
      let liqs = [];
      let borrowers = [];
      liquidations.forEach(l => {
        if (borrowers.indexOf(l.addr) === -1) {
          borrowers.push(l.addr);
          liqs.push(l);
        }
      })
      this.setState({liquidations: liqs})
    })
  }

  fetchPrice() {
    terra.wasm.contractQuery(ORACLE, {"prices":{}}).then(res => {
      let price = parseFloat(res.Ok.prices[0].price);
      this.setState({price})
    });
  }

  clear() {
    this.setState({liquidationMsgs: []})
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

  addToLiquidations(borrower) {
    const walletAddress = localStorage.getItem('walletAddress')
    let overseerContract = "terra1tmnqgvg567ypvsvk6rwsga3srp7e3lg6u0elp8"
    let liqs = this.state.liquidationMsgs;
    let newMsg = new MsgExecuteContract(walletAddress, overseerContract, {
      "liquidate_collateral": {
        "borrower": borrower
      }
    })
    liqs.push(newMsg);
    this.setState({liquidationMsgs: liqs})
  }

  async liquidateAll() {
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
      msgs: this.state.liquidationMsgs,
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
    });

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
      console.log("DONE")
      this.setState({loading: false, liquidationMsgs: []})
      setTimeout(() => {
        this.fetchBid();
      }, 5000)
    }).catch(err => {
      attempts++;
      if (attempts < 100) {
        setTimeout(()=>{
          this.getTxResult(txHash, borrower, attempts)
        }, 500)
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
            <button onClick={this.liquidateAll}>Liquidate All {this.state.liquidationMsgs.length}</button>
            <button onClick={this.clear}>clear</button>
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
            <p>{(parseFloat(l.bLunaAmount)/1000000).toFixed(6)} bLuna</p>
            <p>{l.humanReadableUstAmount} UST</p>
            {l.liquidationPrice > this.state.price &&
              <p><b>{l.liquidationPrice}</b></p>
            }
            {l.liquidationPrice < this.state.price &&
              <p>{l.liquidationPrice}</p>
            }
            {!localStorage.getItem(l.addr) &&
            <p>
              <button onClick={()=> {this.liquidate(l.addr)}}>Liquidate</button>
              <button onClick={()=> {this.addToLiquidations(l.addr)}}>Add</button>
            </p>
            }
          </li>
        )}
      </ul>
    )
  }
}

export default Offers;

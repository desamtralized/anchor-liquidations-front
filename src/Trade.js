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

class Trade extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
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
      }
    }

  }

  componentDidMount() {
    let tradeAddr = this.props.match.params.id;
    fetch(USD_COP_API).then(res => {
      return res.json()
    }).then(rate => {
      this.setState({conversionRate: parseInt(rate.quotes['USDCOP'])})
    })
    terra.wasm.contractQuery(tradeAddr, {"config":{}}).then(res => {
      const trade = res
      let query = {"load_offer": {"id": parseInt(trade.offer_id)}};
      terra.wasm.contractQuery(OFFERS_CONTRACT, query).then(offer => {
        console.log('offer', offer)
        this.setState({offer, trade})
      })
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
        {this.state.offer.offer_type == 'sell' && 
          <h1>You are buying {this.state.trade.amount} from <span>{formatAddress(this.state.offer.owner)}</span></h1>
        }
        <div className="receipt">
          <div className="row">
            <p>Seller puts UST in escrow</p>
            <p className="color">Done</p>
          </div>
          <div className="row">
            <p>Buyer pays seller directly</p>
            <p>Waiting</p>
          </div>
          <div className="row">
            <p>Escrow released to buyer</p>
            <p>Waiting</p>
          </div>
        </div>
      </section>
    )
  }
}

export default withRouter(Trade);

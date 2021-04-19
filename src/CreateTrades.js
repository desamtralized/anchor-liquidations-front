import React from 'react';
import { LCDClient, MsgExecuteContract, Extension } from '@terra-money/terra.js';

import flagCO from './assets/co.svg';
import flagUST from './assets/ic_ust.svg';
import icArrowDown from './assets/ic_arrow.svg';

const terra = new LCDClient({
  URL: 'https://tequila-lcd.terra.dev',
  chainID: 'tequila-0004',
});

const CONTRACT = 'terra1hhgpedc3w04qe3x72j4mvx7xamv6yauap7hj5j'
const ext = new Extension();

class Offers extends React.Component {


  constructor(props) {
    super(props);

    this.state = {offer: {
      type: 'buy',
      fiat_currency: 'cop',
      min_amount: 0,
      max_amount: 0
    }}

    this.handleTypeChange = this.handleTypeChange.bind(this)
    this.handleMinAmountChange = this.handleMinAmountChange.bind(this)
    this.handleMaxAmountChange = this.handleMaxAmountChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.initWallet = this.initWallet.bind(this)
  }

  componentDidMount() {
    this.initWallet()
  }

  async initWallet() {
    let response = await ext.request('connect')
    console.log('wallet response', response.payload)
    localStorage.setItem('walletAddress', response.payload.address)
  }

  handleTypeChange(evt) {
    let offer = this.state.offer
    offer.type = evt.target.value
    this.setState({offer})
  }

  handleMinAmountChange(evt) {
    let offer = this.state.offer
    offer.min_amount = evt.target.value
    this.setState({offer})
  }

  handleMaxAmountChange(evt) {
    let offer = this.state.offer
    offer.max_amount = evt.target.value
    this.setState({offer})
  }

  async handleSubmit(evt) {
    evt.preventDefault()
    const createOfferMsg = new MsgExecuteContract()
    createOfferMsg.sender = localStorage.getItem('walletAddress')
    createOfferMsg.contract = CONTRACT
    createOfferMsg.execute_msg = {
      "create": {
        "offer": {
          "offer_type": this.state.offer.type,
          "fiat_currency": this.state.offer.fiat_currency,
          "min_amount": parseInt(this.state.offer.min_amount),
          "max_amount": parseInt(this.state.offer.max_amount)
        }
      }
    }

    let res = await ext.post({
      msgs: [createOfferMsg]
    });
    console.log('res', res)
  }

 
  render() {
    return (
      <section class="create-trade">

        <h1>You are buying from <span>sambarboza</span></h1>
        <h2>1 UST = COP$ 3,659.00</h2>

          <div className="input-wrap">
            <img src={flagUST} alt=""/>
            <span>UST</span>
            <input type="text" placeholder="100"/>
          </div>
          <div className="input-wrap">
            <img src={flagCO} alt=""/>
            <span>COP</span>
            <input type="text" placeholder="3,950000.00"/>
          </div>

          <img class="icon-separator" src={icArrowDown} alt=""/>

          <div className="receipt">
            <div className="row">
              <p>Trading fee</p>
              <p>3,659.00 COP</p>
            </div>
            <div className="row">
              <p>You will get</p>
              <p class="bold">100.00 UST</p>
            </div>
            <div className="row">
              <p>You will pay</p>
              <p class="bold color">369,559.00 COP</p>
            </div>
          </div>

          <button>open transaction</button>

      </section>
    )
  }
}

export default Offers;

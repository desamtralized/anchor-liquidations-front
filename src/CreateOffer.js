import React from 'react';
import { LCDClient, MsgExecuteContract, Extension, Wallet } from '@terra-money/terra.js';

const terra = new LCDClient({
  URL: 'https://tequila-lcd.terra.dev',
  chainID: 'tequila-0004',
});

const CONTRACT = 'terra1hhgpedc3w04qe3x72j4mvx7xamv6yauap7hj5j'
const extension = new Extension();

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

  handleSubmit(evt) {
    evt.preventDefault()
    console.log(this.state)
    extension.on("connect", (wallet) => {
      console.log('wallet', wallet)
      this.setState({wallet})
    });
    console.log(this.state.offer)
    extension.connect();
    const createOfferMsg = new MsgExecuteContract()
    createOfferMsg.sender = 'terra17h9mgy45yht6eg9mvyna52e05nfh8slg6s8tse'
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

    extension.post({
      msgs: [createOfferMsg]
    });
  }

  componentDidMount() {
    extension.on("connect", (wallet) => {
      console.log('wallet', wallet)
      this.setState({wallet})
    });
    extension.connect();
  }
  
  render() {
    return (
      <div>
        Hello {this.state.wallet && this.state.wallet.key.accAddress}
        <form action="#">
          <label>
            Type:
            <select value={this.state.offer.type} onChange={this.handleTypeChange}>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </label>

          <label>
            Min Amount:
            <input value={this.state.min_amount} onChange={this.handleMinAmountChange}/>
          </label>

          <label>
            Max Amount:
            <input value={this.state.max_amount} onChange={this.handleMaxAmountChange}/>
          </label>

          <input type="submit" value="Submit" onClick={this.handleSubmit}/>
        </form>
      </div>
    )
  }
}

export default Offers;

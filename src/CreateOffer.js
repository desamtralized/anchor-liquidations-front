import React from 'react';
import { LCDClient, MsgExecuteContract, Extension } from '@terra-money/terra.js';
import { formatAddress } from './utils';
import { OFFERS_CONTRACT } from './constants';

const terra = new LCDClient({
  URL: 'https://tequila-lcd.terra.dev',
  chainID: 'tequila-0004',
});

const ext = new Extension();

class Offers extends React.Component {

  constructor(props) {
    super(props);

    console.log('props', props)
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
    let orderQuery = {"load_offers": {"fiat_currency": "cop"}};
    terra.wasm.contractQuery(OFFERS_CONTRACT, orderQuery).then(offers => {
      this.setState({offers})
    })
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
    createOfferMsg.contract = OFFERS_CONTRACT 
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

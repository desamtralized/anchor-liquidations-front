import React from 'react';
import { LCDClient, Key } from '@terra-money/terra.js';

import flagCO from './assets/co.svg';

const terra = new LCDClient({
  URL: 'https://tequila-lcd.terra.dev',
  chainID: 'tequila-0004',
});

class Offers extends React.Component {

  offerTypeLabels = {"buy": "Sell", "sell": "Buy"}

  constructor(props) {
    super(props);

    this.state = {
        offers: []
    }
  }

  componentDidMount() {
    let orderQuery = {"load_offers": {"fiat_currency": "cop"}};
    terra.wasm.contractQuery('terra1uffnkfu6wk9szpgar5ythyxtv0dxpylnxq8ref', orderQuery).then(offers => {
      this.setState({offers})
    })
  }

  formatAddress(address) {
    let start = address.substr(0, 8)
    let length = address.length
    let end = address.substr(length-6, length-1)
    return `${start}...${end}`
  }
  
  render() {
    return (
      <ul class="offers-list">
        {this.state.offers.map(offer=> {
          return (
          <li>
              <div class="currency">
                <img src={flagCO} alt="Flag Colombia"/> 
                <p>{offer.fiat_currency}</p>
              </div>
              <p class="owner">{this.formatAddress(offer.owner)}</p>
              <p>Min ${(offer.min_amount/1000000).toFixed(2)} - Max ${(offer.max_amount/1000000).toFixed(2)}</p>

              <p class="price">COP$ 3,608.00</p>

            <button type="button">{this.offerTypeLabels[offer.offer_type]}</button>

          </li>)
        })}
      </ul>
    )
  }
}

export default Offers;

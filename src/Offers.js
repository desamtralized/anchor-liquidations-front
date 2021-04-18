import React from 'react';
import { LCDClient, Key } from '@terra-money/terra.js';

import flagCO from './assets/co.svg';

const terra = new LCDClient({
  URL: 'https://tequila-lcd.terra.dev',
  chainID: 'tequila-0004',
});

class Offers extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        offers: []
    }
  }

  componentDidMount() {
    let orderQuery = {"load_offers": {"fiat_currency": "cop"}};
    terra.wasm.contractQuery('terra1hhgpedc3w04qe3x72j4mvx7xamv6yauap7hj5j', orderQuery).then(offers => {
      this.setState({offers})
    })
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
              <p class="owner">{offer.owner}</p>
              <p>{offer.min_amount} - {offer.max_amount}</p>

            <button type="button">{offer.order_type}</button>

          </li>)
        })}
      </ul>
    )
  }
}

export default Offers;

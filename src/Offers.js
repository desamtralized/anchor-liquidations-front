import React from 'react';
import { LCDClient, Key } from '@terra-money/terra.js';
import { Link } from "react-router-dom";
import { formatAddress, formatAmount } from './utils';
import { OFFERS_CONTRACT } from './constants';

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
    terra.wasm.contractQuery(OFFERS_CONTRACT, orderQuery).then(offers => {
      this.setState({offers})
    })
  }

  render() {
    return (
      <ul class="offers-list">
        {this.state.offers.map(offer=> {
          if (offer.id != 3) {
            return (
              <li>
                <div class="currency">
                  <img src={flagCO} alt="Flag Colombia"/> 
                  <p>{offer.fiat_currency}</p>
                </div>
                <p class="owner">{formatAddress(offer.owner)}</p>
                <p>Min ${formatAmount(offer.min_amount)} - Max ${formatAmount(offer.max_amount)}</p>

                <p class="price"> </p>

              <Link to={`/offer/${offer.id}`}>
                <button type="button">{this.offerTypeLabels[offer.offer_type]}</button>
              </Link>
            </li>)
          }
        })}
      </ul>
    )
  }
}

export default Offers;

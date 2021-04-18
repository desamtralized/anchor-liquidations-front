import React from 'react';
import { LCDClient, Key } from '@terra-money/terra.js';

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
      <ul>
        {this.state.offers.map(offer=> {
          return (<li>{offer.owner} - {offer.order_type} - {offer.fiat_currency} - {offer.min_amount} - {offer.max_amount}</li>)
        })}
      </ul>
    )
  }
}

export default Offers;

import React from 'react';
import { LCDClient, Extension } from '@terra-money/terra.js';
import logo from './assets/logo-horizontal.svg';
import icWallet from './assets/ic_wallet.svg';
import { formatAddress } from './utils';

import {
  Link
} from "react-router-dom";
 
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-4',
});

const ext = new Extension();

class Header extends React.Component {

  constructor(props) {
    super(props);

    this.initWallet = this.initWallet.bind(this)

    this.state = {
      walletAddress : null
    }
  }

  componentDidMount() {
    let storedWalletAddress = localStorage.getItem('walletAddress')
    if (storedWalletAddress) {
      this.setState({walletAddress: storedWalletAddress})
    }
  }

  async initWallet() {
    let response = await ext.request('connect')
    let walletAddress = response.payload.address
    localStorage.setItem('walletAddress', walletAddress)
    this.setState({walletAddress})
  }
   
  render() {
    return (
      <header>
        <Link to="/">
          <img src={logo} alt="Logo LocalTerra" className="logo"/>
        </Link>
        <button class="btn-wallet" onClick={this.initWallet}>
          {this.state.walletAddress && <p>{formatAddress(this.state.walletAddress)}</p>}
          {!this.state.walletAddress && <p>connect</p>}
          <img src={icWallet} alt=""/>
        </button>
      </header>
    )
  }
}

export default Header;

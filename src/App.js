import Offers from './Offers';
import CreateOffer from './CreateOffer';
import CreateTrades from './CreateTrades';
import './css/main.min.css';

import logo from './assets/logo-horizontal.svg';
import icWallet from './assets/ic_wallet.svg';

function App() {
  return (
    <div className="App">
      
      <header>
        <img src={logo} alt="Logo LocalTerra" className="logo"/>
        <button class="btn-wallet">
          <p>connect</p>
          <img src={icWallet} alt=""/>
        </button>
      </header>

      <section className="App-header">
        {/*<Offers />*/}
        {/*<CreateOffer />*/}
        <CreateTrades />
      </section>

    </div>
  );
}

export default App;
  
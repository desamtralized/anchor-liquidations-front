import Offers from './Offers';
import CreateOffer from './CreateOffer';
import CreateTrade from './CreateTrade';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './css/main.min.css';
import logo from './assets/logo-horizontal.svg';
import icWallet from './assets/ic_wallet.svg';

function App() {
  return (
    <Router>
      <div className="App">
        
        <header>
          <Link to="/">
            <img src={logo} alt="Logo LocalTerra" className="logo"/>
          </Link>
          <button class="btn-wallet">
            <p>connect</p>
            <img src={icWallet} alt=""/>
          </button>
        </header>

        <section className="App-header">
          <Switch>
            <Route path="/offer/:id">
              <CreateTrade />
            </Route>
            <Route path="/">
              <Offers/>
            </Route>
          </Switch>
        </section>

      </div>
    </Router>
  );
}

export default App;
  
import Offers from './Offers';
import CreateOffer from './CreateOffer';
import './css/main.min.css';

import logo from './assets/logo-horizontal.svg';

function App() {
  return (
    <div className="App">
      <header>
        <img src={logo} alt="Logo LocalTerra" className="logo"/>
      </header>
      <section className="App-header">
        <Offers />
        <CreateOffer />
      </section>
    </div>
  );
}

export default App;
  
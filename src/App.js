import logo from './logo.svg';
import Offers from './Offers';
import CreateOffer from './CreateOffer';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Offers />
        <CreateOffer />
      </header>
    </div>
  );
}

export default App;

import Offers from './Offers';
import CreateOffer from './CreateOffer';
import CreateTrade from './CreateTrade';
import Header from './Header';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './css/main.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />       
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
  
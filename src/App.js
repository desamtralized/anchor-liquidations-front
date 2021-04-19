import Offers from './Offers';
import Offer from './Offer';
import Header from './Header';
import Trade from './Trade';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import './css/main.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />       
        <section className="App-header">
          <Switch>
            {/* Create Trade */}
            <Route path="/offer/:id">
              <Offer />
            </Route>

            {/* Trade Details */}
            <Route path="/trade/:id">
              <Trade/>
            </Route>

            {/* Home */}
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
  
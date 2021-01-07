import './App.css';
import BehaviourMapping from './pages/BehaviourMapping'
import Login from './pages/login'
import Startpage from './pages/startpage'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';



function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path='/' exact component={Login} />
          <Route path='/startpage' exact component={Startpage} />
          <Route path='/mapping' component={BehaviourMapping} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;

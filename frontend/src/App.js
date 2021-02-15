import './App.css';
import BehaviourMapping from './pages/BehaviourMapping'
import NewProject from './pages/newProject'
import Login from './pages/login'
import Startpage from './pages/startpage'
import ChooseImage from './pages/ChooseImage'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import React from 'react';
import LoadProject from './pages/loadProject';



function App() {

  return (
    <div className="App">
      <Router basename="/behaviourmapper">
        <Switch>
          <Route path='/' exact component={Login} />
          <Route path='/startpage' component={Startpage} />
          <Route path='/newproject' component={NewProject} />
          <Route path='/chooseimage' component={ChooseImage} />
          <Route path='/mapping' component={BehaviourMapping} />
          <Route path='/loadproject' component={LoadProject} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;

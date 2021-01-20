import './App.css';
import BehaviourMapping from './pages/BehaviourMapping'
import NewProject from './pages/newProject'
import Login from './pages/login'
import Startpage from './pages/startpage'
import ChooseImage from './pages/ChooseImage'
import UploadMap from './pages/UploadMap'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';



function App() {
  const [placeholder, setPlaceholder] = useState('Flask server not running');

  useEffect(() => {
    fetch('/hello').then(res => res.json()).then(data => {
      setPlaceholder(data.result);
    });
  }, []);

  return (
    <div className="App">
    <header className="App-header">
      <p>Flask says {placeholder}</p>
    </header>
      <Router>
        <Switch>
          <Route path='/' exact component={Login} />
          <Route path='/startpage' component={Startpage} />
          <Route path='/newproject' component={NewProject} />
          <Route path='/chooseImage' component={ChooseImage} />
          <Route path='/mapping' component={BehaviourMapping} />
          <Route path='/upload' component={UploadMap} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;

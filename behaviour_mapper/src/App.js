import './App.css';
import BehaviourMapping from './pages/BehaviourMapping'
import Login from './pages/login'
import Startpage from './pages/startpage'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';



function App() {
  const [placeholder, setPlaceholder] = useState('Hi');

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
          <Route path='/startpage' exact component={Startpage} />
          <Route path='/mapping' component={BehaviourMapping} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;

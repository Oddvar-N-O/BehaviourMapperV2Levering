import './App.css';
import BehaviourMapping from './pages/BehaviourMapping'
import NewProject from './pages/newProject'
import Login from './pages/login'
import Startpage from './pages/startpage'
import ChooseImage from './pages/ChooseImage'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import React, { Suspense } from 'react';
import ManageProject from './pages/manageProject';
import {AuthContext} from './pages/auth/AuthContext'
import LanguageSelector from './components/languageSelector'
import './i18n';

function App() {
  return (
    <AuthContext>
      <Suspense fallback="loading">
        <div className="App">
          <Router basename="/behaviourmapper">
            <LanguageSelector></LanguageSelector>
            <Switch>
              <Route path='/' exact component={Login} />
              <Route path='/startpage' component={Startpage} />
              <Route path='/newproject' component={NewProject} />
              <Route path='/chooseimage' component={ChooseImage} />
              <Route path='/mapping' component={BehaviourMapping} />
              <Route path='/manageProject' component={ManageProject} />
            </Switch>
          </Router>
        </div>
      </Suspense>
    </AuthContext>
  );
}

export default App;

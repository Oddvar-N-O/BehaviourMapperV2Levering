import React from 'react';
import ReactDOM from 'react-dom';
import Kart from '../Kart';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Kart />, div);
});
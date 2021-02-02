import React from 'react';
import ReactDOM from 'react-dom';
import SidebarLP from '../sidebarLP';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SidebarLP />, div);
});
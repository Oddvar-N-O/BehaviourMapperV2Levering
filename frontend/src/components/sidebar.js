import React from 'react';
import Symbol from './Symbol';

function sidebar(props) {
    return (
      <div className="sidebar">
          <ul>
            <li><Symbol 
            inf={{img: "No", desc: "Mann"}}
            /></li>
            <li><Symbol 
            inf={{img: "No", desc: "Dame"}}
            /></li>
            <li><Symbol 
            inf={{img: "No", desc: "Med hund"}}
            /></li>
            <li><Symbol 
            inf={{img: "No", desc: "Sketboard"}}
            /></li>
          </ul>
      </div>
    );
  }

  export default sidebar;
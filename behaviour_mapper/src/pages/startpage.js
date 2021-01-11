import React from 'react';
import { Link } from 'react-router-dom';
import './startpage.css';



function Startpage() {
    return (
      <div className="startpage">
        <ul id='start-menu'>
        <Link to="/mapping"><li>New Project</li></Link>
          <li className='start-menu-li'>Load Project</li>
          <li>User Profile</li>
        </ul>
        <ul id='load-map'>
          <li>Load map from file</li>
          <li>Use web-map</li>
        </ul>
      </div>
    );
  }
  
  export default Startpage;
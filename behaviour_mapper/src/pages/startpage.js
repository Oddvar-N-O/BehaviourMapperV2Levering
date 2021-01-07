import React from 'react';
import { Link } from 'react-router-dom';

function Startpage() {
    return (
      <div className="login">
          <Link to="/mapping">Go to map</Link>
      </div>
    );
  }
  
  export default Startpage;
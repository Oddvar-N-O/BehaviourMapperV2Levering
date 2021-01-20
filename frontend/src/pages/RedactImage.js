import React from 'react';
import Kart from '../components/Kart';
import Sidebar from '../components/sidebar'
import './BehaviourMapping.css'



function RedactImage() {
    return (
      <div className="behaviour-mapping">
        <Sidebar />
        <h1>REDACTIMAGE</h1>
        <Kart />
        <form>
        </form>
      </div>
    );
  }
  
  export default RedactImage;
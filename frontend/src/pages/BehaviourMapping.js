import React from 'react';
import Kart from '../components/Kart';
import Sidebar from '../components/sidebar'
import './BehaviourMapping.css'



function BehaviourMapping() {
    return (
      <div className="behaviour-mapping">
        <Sidebar />
        <Kart />
        <form>
        </form>
      </div>
    );
  }
  
  export default BehaviourMapping;
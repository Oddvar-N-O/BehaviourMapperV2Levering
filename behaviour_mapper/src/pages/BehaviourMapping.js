import React, { Component } from 'react';
import Map from 'components/map';
import Sidebar from 'components/sidebar'
import 'pages/BehaviourMapping.css'



function BehaviourMapping() {
    return (
      <div className="behaviour-mapping">
        <Map />
        <Sidebar />
      </div>
    );
  }
  
  export default BehaviourMapping;
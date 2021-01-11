import React, { Component } from 'react';
import Map from '../components/map';
import Sidebar from '../components/sidebar'
import './BehaviourMapping.css'



function BehaviourMapping() {
    return (
      <div className="behaviour-mapping">
        <h1>TEST</h1>
        <Map />
        <Sidebar />
        <form>
        </form>
      </div>
    );
  }
  
  export default BehaviourMapping;
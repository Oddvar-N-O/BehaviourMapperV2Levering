import React from 'react';
import Kart from '../components/Kart';
import Sidebar from '../components/sidebar'
import './BehaviourMapping.css'



function BehaviourMapping() {

  function appendData() {
    this.displayData.push(<div  id="display-data"><pre>{this.state.postVal}</pre></div>);
    this.setState({
      showdata : this.displayData,
      postVal : ""
    });
  }

  function showMarker(event) {
    console.log (event);
    /*var container = document.getElementById('divImgContainer')
    var icon = document.createElement("DIV");
    icon.classList.add('dar');
    container.appendChild(icon); */
    
    var mark = document.getElementById('icon');
    mark.style.top =  (event.clientY)+'px';
    mark.style.left = (event.clientX) +'px';
  }

    return (
      <div id='maincont'>
        <img onClick={e => showMarker(e)} id='backgroundImage' height="500px" width="500px" src="https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png" />
        <div id='icon' > <img width='100px' height='100px' id='myimage' src='https://miro.medium.com/max/1200/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg'></img></div>
      </div>
    );
  }
  
  export default BehaviourMapping;
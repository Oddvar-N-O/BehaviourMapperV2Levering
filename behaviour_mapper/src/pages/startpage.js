import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './startpage.css';


// function change_visibility() {
//   if (new_project) {
//     new_project = false
//   }
//   else {
//     new_project = true
//   }
// }

function Startpage() {
  const [new_project, setNewProject] = useState(false)

  const hideSection = () => setNewProject(!new_project)

    return (
      <div className="startpage">
        <ul id='start-menu'>
        <li onClick={hideSection}>New Project</li>
          <li className='start-menu-li'>Load Project</li>
          <li>User Profile</li>
        </ul>
        <ul id={new_project ? 'load-map' : 'invisible'}>
          <li>Load map from file</li>
          <li>Use web-map</li>
        </ul>
      </div>
    );
  }
  
  export default Startpage;
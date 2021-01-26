/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
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
  // State for new_project
  const [new_project, setNewProject] = useState(false) // set state for new_project to false
  const changeNewVisibility = () => setNewProject(!new_project) // change state for new procject (true/false)
  const hideNewProject = () => setNewProject(false) // set state to false

  // State for load_project
  const [load_project, setLoadProject] = useState(false)
  const changeLoadVisibility = () => setLoadProject(!load_project) 
  const hideLoadProject = () => setLoadProject(false) 

  // State for User Profile
  // const [user_profile, setUserProfile] = useState(false)
  // const changeUserVisibility = () => setUserProfile(!user_profile) 
  // const hideUserProfile = () => setUserProfile(false) 

    return (
      <div className="startpage">
        <h1>Behaviour Mapper</h1>
        <ul id='start-menu'>
          {/* NEW PROJECT */}
          <li onClick={ () => { hideLoadProject(), changeNewVisibility() }}
            className={new_project ? 'active' : 'passive'}
            >New Project</li>
          {/* LOAD PROJECT */}
          <li onClick={ () => { hideNewProject(), changeLoadVisibility() }}
            className={load_project ? 'active' : 'passive'}
          >Load Project</li>
          {/* USER PROFILE */}
          <li onClick={hideNewProject}>User Profile</li>
        </ul>
        <ul id={new_project ? 'load-map' : 'invisible'}>
          <Link to="/newproject"><li>Use Web-map</li></Link>
          {/* <li>Use Template??</li> */}
          <Link to="/upload"><li>Load Map From File</li></Link>
        </ul>
      </div>
    );
  }
  
  export default Startpage;
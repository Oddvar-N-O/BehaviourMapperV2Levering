/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './startpage.css';
import { Authenticated } from './auth/AuthContext'




function Startpage() {
  // State for new_project
  const [new_project, setNewProject] = useState(false) // set state for new_project to false
  const changeNewVisibility = () => setNewProject(!new_project) // change state for new procject (true/false)
  const hideNewProject = () => setNewProject(false) // set state to false

  // State for load_project
  const [load_project, setLoadProject] = useState(false)
  const changeLoadVisibility = () => setLoadProject(!load_project) 
  const hideLoadProject = () => setLoadProject(false) 
  const logout = () => window.location.href = "https://auth.dataporten.no/openid/endsession"
  
  // State for User Profile
  // const [user_profile, setUserProfile] = useState(false)
  // const changeUserVisibility = () => setUserProfile(!user_profile) 
  // const hideUserProfile = () => setUserProfile(false) 

    return (
      <Authenticated>
        <div className="startpage">
          <h1>Behaviour Mapper</h1>
          <div className="menu">
            <ul id='start-menu'>
              {/* NEW PROJECT */}
              <li onClick={ () => { hideLoadProject(), changeNewVisibility() }}
                className={new_project ? 'active' : 'passive'}
                >New Project</li>
              {/* LOAD PROJECT */}
              <li onClick={ () => { hideNewProject(), changeLoadVisibility() }}
                className={load_project ? 'active' : 'passive'}
              ><Link to={"/loadproject"}>Load Project</Link></li>
              {/* LOG OUT */}
              <li onClick={ () => { logout() }}>Log Out</li>
            </ul>
            <ul id={new_project ? 'load-map' : 'invisible'}>
              <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: false,
                    projectName: "",
                    description: "",
                }
                }}><li>Use Web-map</li></Link>
                {/* <li>Use Template??</li> */}
                <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: true,
                    projectName: "",
                    description: "",
                }
                }}><li>Load Map From File</li></Link>
            </ul>
          </div>
        </div>
      </Authenticated>
    );
  }
  
  export default Startpage;
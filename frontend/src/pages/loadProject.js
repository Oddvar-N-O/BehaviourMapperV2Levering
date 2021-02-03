import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLP from '../components/sidebarLP';
import './loadProject.css'

function LoadProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  // const [allEvents, setallEvents] = useState('No event for this project')
  const [currProjName, setCurrProjName] = useState(null);
  const [currProjId, setcurrProjId] = useState(null);
  const [currProjDesc, setcurrProjDesc] = useState(null);
  const [currProjScrsh, setcurrProjScrsh] = useState(null);
  const [showProjInfo, setshowProjInfo] = useState(false);

  useEffect(() => {
    // get userID from loggedonuser
    var userID = 1;
    var fetchstring = `getproject?u_id=${userID}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setAllProjects(data);
      fetchstring = `getproject?u_id=${userID}`
    });
  }, []);

  const getCurrProj = (index) => {
    for (var i = 0; i < allProjects.length; i++) {
      if (allProjects[i][1] === index) {
        setshowProjInfo(true);
        setcurrProjId(allProjects[i][0]);
        setCurrProjName(allProjects[i][1]);
        setcurrProjDesc(allProjects[i][2]);
        setcurrProjScrsh(allProjects[i][4]);
      }
    }
  }

  return (
        <div id="load-project">
          <div className="load-project-box">
            <SidebarLP  getCurrProj={getCurrProj} projects={allProjects} />
            <div className={showProjInfo ? "show-project-list" : "hide-project-list"}>
              <h1>Description: {currProjDesc}</h1>
              <p>Project id: {currProjId} Name: {currProjName} Screenshot: {currProjScrsh}</p>
              <img alt={'Screenshot av kartet til '+ currProjName + '.'} id='opplastetKart' />
              <button><Link></Link>Choose this project</button>
            </div>
          </div>
        </div>
  )
}
export default LoadProject
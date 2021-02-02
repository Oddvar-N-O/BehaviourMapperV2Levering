import React, { useState, useEffect } from 'react';
import SidebarLP from '../components/sidebarLP';
import './loadProject.css'

function LoadProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  const [currProjName, setCurrProjName] = React.useState(null);
  const [currProjId, setcurrProjId] = React.useState(null);
  const [currProjDesc, setcurrProjDesc] = React.useState(null);
  const [currProjMap, setcurrProjMap] = React.useState(null);
  const [showProjInfo, setshowProjInfo] = React.useState(false);

  useEffect(() => {
    // get userID from loggedonuser
    var userID = 1;
    var fetchstring = `getproject?u_id=${userID}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setAllProjects(data);
    });
  }, []);

  const getCurrProj = (index) => {
    for (var i = 0; i < allProjects.length; i++) {
      if (allProjects[i][1] === index) {
        setshowProjInfo(true);
        setcurrProjId(allProjects[i][0]);
        setCurrProjName(allProjects[i][1]);
        setcurrProjDesc(allProjects[i][2]);
        setcurrProjMap(allProjects[i][3]);
      }
    }
    
  }

  return (
        <div id="loadproject">
          <SidebarLP  getCurrProj={getCurrProj} projects={allProjects} />
          <div className={showProjInfo ? "ShowProjectList" : "hideProjectList"}>
            <h1>Description: {currProjDesc}</h1>
            <p>Project id: {currProjId} name: {currProjName} map: {currProjMap}</p>
            <img alt={'kartet til '+ currProjName + '.'} id='opplastetKart'/>
          </div>
        </div>
  )
}
export default LoadProject
import React, { useState, useEffect } from 'react';
import SidebarLoad from '../components/sidebarLP';
import './loadProject.css'

function LoadProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  // const projectName = "";
  // const projectID = "";

  useEffect(() => {
    // get userID from loggedonuser
    var userID = 1;
    var fetchstring = `getproject?u_id=${userID}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setAllProjects(data);
    });
  }, []);

  return (
        <div id="loadproject">
          <SidebarLoad projects={allProjects}/>
          <div className="projectList">
            {allProjects}
          </div>
        </div>
  )
}
export default LoadProject
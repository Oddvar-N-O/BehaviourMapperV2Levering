import React, { useState, useEffect } from 'react';
import SidebarLP from '../components/sidebarLP';
import './loadProject.css'

function LoadProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  const [currProj, setCurrProj] = React.useState(null);
  // const currentProjectID = "";
  // const currentProjectDesc = "";
  // const currentProjectMap = "";

  useEffect(() => {
    // get userID from loggedonuser
    var userID = 1;
    var fetchstring = `getproject?u_id=${userID}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setAllProjects(data);
    });
  }, []);

  const getCurrProj = (index) => {
    console.log(index);
    setCurrProj(index);
  }

  return (
        <div id="loadproject">
          <SidebarLP  getCurrProj={getCurrProj} projects="test" />
          <div className="projectList">
            {allProjects}
            <h1>{currProj}</h1>
          </div>
        </div>
  )
}
export default LoadProject
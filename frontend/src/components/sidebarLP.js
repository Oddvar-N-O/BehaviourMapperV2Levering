import React from 'react';

function sidebar(getCurrProj, projects) {
  const listElements = [];
  function getProject(e) {
    e.preventDefault();
    return e.target.innerHTML
  }
  console.log("prosjekt", projects, "getCurr", getCurrProj)
  if (projects.projects !== "No projects found") {
    for (var i = 0; i < projects.projects.length; i++) {
      listElements.push(
        <li className="projectName" 
            key={projects.projects[i][0]} 
            onClick={() => {
              getCurrProj({getProject});
            }}>
          {projects.projects[i][1]}
        </li>
      )
    }
  }  
  return (
    <div className="sidebarLP">
      <ul>
        {listElements}
      </ul>
    </div>
  );
}


  export default sidebar;
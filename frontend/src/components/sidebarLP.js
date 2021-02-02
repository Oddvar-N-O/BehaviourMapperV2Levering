import React from 'react';

function sidebar(projects) {
  const listElements = [];
  if (projects.projects !== "No projects found") {
    for (var i = 0; i < projects.projects.length; i++) {
      listElements.push(<li className="projectName" key={projects.projects[i][0]}>{projects.projects[i][1]}</li>)
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
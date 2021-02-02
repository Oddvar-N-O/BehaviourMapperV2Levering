import React from 'react';

function sidebar(props) {
  const listElements = [];
  if (props.projects!== "No projects found") {
    for (var i = 0; i < props.projects.length; i++) {
      listElements.push(
        <li className="projectName" 
            key={props.projects[i][0]} 
            onClick={(e) => {
              props.getCurrProj(e.target.innerHTML);
            }}>
          {props.projects[i][1]}
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
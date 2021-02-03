import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLP from '../components/sidebarLP';
import './loadProject.css'

function LoadProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  const [allEvents, setallEvents] = useState('No event for this project')
  const [currProj, setCurrProj] = useState({});
  const [showProjInfo, setshowProjInfo] = useState(false);

  useEffect(() => {
    // get userID from loggedonuser
    var userID = 1;
    var fetchstring = `getproject?u_id=${userID}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setAllProjects(data);
    });
  }, []);

  useEffect(() => {
    var fetchstring = `getevents?p_id=${currProj['id']}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setallEvents(data);
    });
  }, [currProj]);

  const getCurrProj = (index) => {
    for (var i = 0; i < allProjects.length; i++) {
      if (allProjects[i][1] === index) {
        setshowProjInfo(true);
        setCurrProj({
          "id": allProjects[i][0], 
          "name": allProjects[i][1],
          "description": allProjects[i][2],
          "map": allProjects[i][3],
          "screenshot": allProjects[i][4],
          "startdate": allProjects[i][5],
          "enddate": allProjects[i][6],
          "zoom": allProjects[i][7],
          "u_id": allProjects[i][8]});      
      }
    }
  }

  return (
        <div id="load-project">
          <div className="load-project-box">
            <SidebarLP  getCurrProj={getCurrProj} projects={allProjects} />
            <div className={showProjInfo ? "show-project-list" : "hide-project-list"}>
              <h1>Description: {currProj["description"]}</h1>
              <p>Project id: {currProj["id"]} Name: {currProj["name"]} Screenshot: {currProj["screenshot"]} Events: {allEvents}</p>
              <img alt={'Screenshot av kartet til '+ currProj["name"] + '.'} id='opplastetKart' />
              <button>
                <Link to={{
                        pathname: "/mapping",
                        data: {
                            project: currProj,
                            events: {allEvents},
                          }
                        }}>Choose this project
                </Link>
              </button>
            </div>
          </div>
        </div>
  )
}
export default LoadProject
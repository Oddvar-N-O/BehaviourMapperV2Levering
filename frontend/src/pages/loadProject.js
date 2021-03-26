import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLP from '../components/sidebarLP';
import * as AiIcons from 'react-icons/ai';
import './loadProject.css'
import { Authenticated, useToken } from './auth/AuthContext'

function LoadProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  const [allEvents, setallEvents] = useState('No event for this project')
  const [currProj, setCurrProj] = useState({"id": null});
  const [showProjInfo, setshowProjInfo] = useState(false);
  const { access_token } = useToken();
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    var fetchstring = `https://auth.dataporten.no/openid/userinfo`
    fetch(fetchstring, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    }).then(res => res.json()).then(data => {
      setUserID(data.sub);
    });
  }, [access_token]);

  useEffect(() => {
    if (userID === null) {
      return
    }
    var fetchstring = window.backend_url + `getproject?u_id=${userID}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setAllProjects(data);
    });
  }, [userID]);


  useEffect(() => {
    if (currProj['id'] === null) {
      return
    }
    var fetchstring = window.backend_url + `getevents?p_id=${currProj['id']}` 
    fetch(fetchstring).then(res => res.json()).then(data => {
      if (data["message"] !== "Bad arg") {
        setallEvents(data);
      }
    });
  }, [currProj]);
  // , {
  //   method: 'GET',
  //   headers: {
  //     Authorization: `Bearer ${access_token}`,
  //     origin: "http://localhost:3000/behaviourmapper/startpage"
  //     }
  //   }

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
    <Authenticated>
      <div id="load-project">
        <div className="load-project-box">
          <Link to="/startpage" className="close-icon">
            <AiIcons.AiOutlineClose />
          </Link>
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
                        },
                      state: {
                        p_id: currProj['id'],
                      },
                      }}>Choose this project
              </Link>
            </button>
          </div>
        </div>
      </div>
    </Authenticated>
  )
}
export default LoadProject;
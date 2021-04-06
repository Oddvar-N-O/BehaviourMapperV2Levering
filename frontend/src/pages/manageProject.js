import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLP from '../components/sidebarLP';
import * as AiIcons from 'react-icons/ai';
import './manageProject.css'

function ManageProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  const [currProj, setCurrProj] = useState({"id": null});
  const [currImage, setCurrImage] = useState(null)
  const [showProjInfo, setshowProjInfo] = useState(false);
  const u_id = window.sessionStorage.getItem("uID");

  useEffect(() => {
    if (u_id === null) {
      return
    }
    var fetchstring = window.backend_url + `getproject?u_id=${u_id}`
    fetch(fetchstring).then(res => res.json())
    .then(data => {
      setAllProjects(data);
    });
  }, [u_id]);

  const getCurrProj = (index) => {
    for (var i = 0; i < allProjects.length; i++) {
      if (allProjects[i][1] === index) {
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

  useEffect(() => {
    if (currProj['id'] === null) {
      return
    }
    var fetchstring = window.backend_url + `getscreenshot?p_id=${currProj['id']}&u_id=${u_id}`
    fetch(fetchstring)
      .then(res => res.blob())
      .then(data => {
        let image = URL.createObjectURL(data);
        setCurrImage(image);
        setshowProjInfo(true);
    });
  }, [currProj, u_id]);

  const shapefile = () => {
    const data = new FormData();
    data.append('p_id', currProj['id']);
    data.append('u_id', u_id);
    fetch(window.backend_url + 'createarcgis', {
      method: 'POST',
      body: data,
      })
      .then(response => response.blob())
      .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "Shapefiles.zip";
        document.body.appendChild(a);
        a.click();    
        a.remove();
      });
    }

  return ( // id="container"
        <div id="load-project">
          <div className="load-project-box">
            <Link to="/startpage" className="close-icon">
              <AiIcons.AiOutlineClose />
            </Link>
            <SidebarLP  getCurrProj={getCurrProj} projects={allProjects} />
            <div className={showProjInfo ? "show-project-list" : "hide-project-list"}>
              <h1>{currProj["name"]}</h1>
              <p>Description: {currProj["description"]}</p>
              <img alt={'Screenshot av kartet til '+ currProj["name"] + '.'} src={currImage} id='opplastetKart' />
              <button onClick={() => shapefile()}>
                Export Shapefiles
              </button>
            </div>
          </div>
        </div>
  )
}

export default ManageProject;
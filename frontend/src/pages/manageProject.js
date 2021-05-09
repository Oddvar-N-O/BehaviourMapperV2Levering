import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLP from '../components/sidebarLP';
import * as AiIcons from 'react-icons/ai';
import './manageProject.css'
import { useTranslation } from 'react-i18next';



function ManageProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  const [currProj, setCurrProj] = useState({"id": null});
  const [currImage, setCurrImage] = useState(null)
  const [showProjInfo, setshowProjInfo] = useState(false);
  const u_id = window.sessionStorage.getItem("uID");
  const {t} = useTranslation('common');

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
          "screenshot": allProjects[i][3],});      
      }
    }
  }

  useEffect(() => {
    if (currProj['id'] === null) {
      setCurrImage(null);
      setshowProjInfo(false);
      return
    } else if (currProj['screenshot'] === undefined || currProj['screenshot'] === null) {
      setCurrImage(null);
      setshowProjInfo(true);
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
  

    function exportZipFiles(e) {
      e.preventDefault();
      let backendAPI, filename
      if (e.target.textContent === "Export to CSV" || e.target.textContent === "Eksporter til CSV") {
        backendAPI = 'exporttocsv'
        filename = 'csvfiles'
      } else if (e.target.textContent === "Export Shapefiles" || e.target.textContent === "Eksporter Shapefiler") {
        backendAPI = 'createarcgis'
        filename = 'shapefiles'
      }
      const data = new FormData();
      data.append('p_id', currProj['id']);
      data.append('u_id', u_id);
      fetch(window.backend_url + backendAPI, {
        method: 'POST',
        body: data,
        })
        .then(response => response.blob())
      .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename + ".zip";
        document.body.appendChild(a);
        a.click();    
        a.remove();
      });
      }

  const deleteProject = () => {
    if (window.confirm("Do you want to delete this project?")) {
      const data = new FormData();
      data.append('p_id', currProj['id']);
      fetch(window.backend_url + 'deleteproject', {
        method: 'POST',
        body: data,
        });
      setTimeout(() => window.location.reload(), 500)
    }
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
              <p>{t('manageProject.description')} {currProj["description"]}</p>
              <img alt={'Screenshot av kartet til '+ currProj["name"] + '.'} src={currImage} id='opplastetKart' />
              <div id="manage-buttons">
              <button onClick={exportZipFiles}>
              {t('manageProject.exportShapefiles')}
              </button>
              <button onClick={exportZipFiles}>
              {t('manageProject.exportToCsv')}
              </button>
              <button onClick={deleteProject}>
              {t('manageProject.delete')}
              </button>
              </div>
            </div>
          </div>
        </div>
  )
}

export default ManageProject;
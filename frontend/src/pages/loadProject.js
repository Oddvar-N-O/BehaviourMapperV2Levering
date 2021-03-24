import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLP from '../components/sidebarLP';
import * as AiIcons from 'react-icons/ai';
import './loadProject.css'

function LoadProject() {
  const [allProjects, setAllProjects] = useState('No projects found');
  const [allEvents, setallEvents] = useState('No event for this project')
  const [currProj, setCurrProj] = useState({"id": 28});
  const [currImage, setCurrImage] = useState('Noimage.jpg')
  const [showProjInfo, setshowProjInfo] = useState(false);


  useEffect(() => {
    // get userID from loggedonuser
    const userID = 1;
    var fetchstring = `getproject?u_id=${userID}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      setAllProjects(data);
    });
  }, []);

  useEffect(() => {
    var fetchstring = `getevents?p_id=${currProj['id']}`
    fetch(fetchstring).then(res => res.json()).then(data => {
      if (data["message"] !== "Bad arg") {
        let events = [];
        for (let i = 0; i < data.length; i++) {
          if (i % 2 === 0) {
            events.push(data[i])
          }
        }
        setallEvents(events);
      }
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
      makeImage()
      clearFormerEvents()
      placeAllFormerEvents()
    }
  }

  const makeImage = () => {
      var fetchstring = `getmap?p_id=${currProj['id']}`
      fetch(fetchstring)
        .then(res => res.blob())
        .then(data => {
          let image = URL.createObjectURL(data);
          setCurrImage(image);
      });
  }

  const clearFormerEvents = () => {
    const myNode = document.getElementById("container");
    if (myNode != null) {
      while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
      }
    }
  }

  const placeAllFormerEvents = () => { // tried async + await
    for (let i=0; i<allEvents.length; i++) {
      let eventset = allEvents[i]
     //  console.log(eventset);
      let f_id = eventset[eventset.length - 1];
      let rotation = eventset[1]
      let originalSize = findIntegerCoordinates(eventset[3]);
      let originalCoord = findIntegerCoordinates(eventset[2]);
      let coord = findNewCoord(originalSize, originalCoord)
      placeFormerEvent(f_id, coord, rotation);
    }
  }

  const findNewCoord = (originalSize, originalCoord) => {
      console.log('OC: ' + originalCoord);
      let percentx = originalCoord[0] / originalSize[0];
      let percenty = originalCoord[1] / originalSize[1];
      // let mapImage = document.getElementById('opplastetKart');
      let newXsize = 300; //mapImage.width;
      let newYsize = 300; // mapImage.height;
      let newXcoord = newXsize * percentx;
      let newYcoord = newYsize * percenty;
      let newccords = [];
      newccords[0] = newXcoord;
      newccords[1] = newYcoord;
      console.log('NC: ' + newccords);
      console.log('-------')
    return newccords;
  }

  const findIntegerCoordinates = (coord) => {
    coord = coord.split(",");
    coord[0] = parseInt(coord[0], 10);
    coord[1] = parseInt(coord[1], 10);
    return coord;
  }

  const placeFormerEvent = (f_id, coord, rotation) => {
    let src;
    fetch(`getimagefromID?f_id=${f_id}`)
    .then(result => result.blob())
    .then(images => {
      src = URL.createObjectURL(images)
      let img = document.createElement('img'); 
      img.classList.add('icon');
      img.style.width = '20px';
      img.style.height = '20px';
      img.src = src;
      document.getElementById('container').appendChild(img);

      img.style.top =  (coord[1] + 300)+'px';
      img.style.left = (coord[0] + 400) +'px';
      if (rotation != null) {
        img.style.transform = rotation;
      }
    });
    return null;
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
              <p>Project id: {currProj["id"]} Name: {currProj["name"]} Screenshot: {currProj["screenshot"]}</p>
              <div id="container"></div>
              <img alt={'Screenshot av kartet til '+ currImage + '.'} src={currImage} id='opplastetKart' />
            </div>
            <button>
                <Link to={{
                        pathname: "/mapping",
                        data: {
                            project: currProj,
                          },
                        state: {
                          p_id: currProj['id'],
                        },
                        }}>Choose this project
                </Link>
              </button>
          </div>
        </div>
  )
}

export default LoadProject
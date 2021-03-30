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
  // const [mapSize, setMapSize] = useState([0, 0]);
  const [scrollValues, setScrolls] = useState([0, 0]);
  const [offsetValues, setOffset] = useState([0, 0]);
  const [iconInfoObjects, setIconInfoObjects] = useState([]);

  useEffect(() => {
    function handleResize() {
      findOffsetOfMap();
      findScroll();
      // findMapSize();
      rePlaceEvents();
    }
    window.addEventListener('resize', handleResize)
  })


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
    setIconInfoObjects([]);
  }

  const placeAllFormerEvents = () => { // tried async + await
    findOffsetOfMap();
    findScroll();
    for (let i=0; i<allEvents.length; i++) {
      let eventset = allEvents[i]
      let f_id = eventset[eventset.length - 1];
      let rotation = eventset[1]

      let originalSize = findIntegerCoordinates(eventset[3]);
      let originalCoord = findIntegerCoordinates(eventset[2]);
      let coord = findNewCoord(originalSize, originalCoord)

      createIconObject(originalCoord, originalSize); // for further use
      placeEvent(f_id, coord, rotation, i);
    }
  }

  const createIconObject = (originalCoord, originalSize) => {
    let icon = {
      originalCoord: originalCoord,
      originalSize: originalSize,
    };
    setIconInfoObjects(iconInfoObjects => [...iconInfoObjects, icon]);
  }

  const findIntegerCoordinates = (coord) => {
    coord = coord.split(",");
    coord[0] = parseInt(coord[0], 10);
    coord[1] = parseInt(coord[1], 10);
    return coord;
  }

  const findNewCoord = (originalSize, originalCoord) => {
      let percentx = originalCoord[0] / originalSize[0];
      let percenty = originalCoord[1] / originalSize[1];
      let mapImage = document.getElementById('opplastetKart');
      let newXsize = mapImage.width;
      let newYsize = mapImage.height;
      let newXcoord = newXsize * percentx;
      let newYcoord = newYsize * percenty;
      let newcords = [];
      newcords[0] = newXcoord;
      newcords[1] = newYcoord;
    return newcords;
  }

  const placeEvent = (f_id, coord, rotation, i) => {
    let src;
    fetch(`getimagefromID?f_id=${f_id}`)
    .then(result => result.blob())
    .then(images => {
      src = URL.createObjectURL(images)
      let img = document.createElement('img');
      img.setAttribute('id', i); 
      // console.log('id: ' + img.getAttribute('id'))
      img.classList.add('icon');
      img.style.width = '20px';
      img.style.height = '20px';
      img.src = src;
      document.getElementById('container').appendChild(img);
      img.style.left = (coord[0] + offsetValues[0] + scrollValues[0]) +'px';
      img.style.top =  (coord[1] + offsetValues[1] + scrollValues[1])+'px';
      if (rotation != null) {
        img.style.transform = rotation;
      }
    });
  }

  //   const [offsetValues, setOffset] = useState([0, 0]);
  const findOffsetOfMap = () => {
    let cont = document.getElementById('opplastetKart');
    let distanceTop = cont.getBoundingClientRect().top;
    let distanceLeft = cont.getBoundingClientRect().left;
    let dist = [distanceLeft, distanceTop];
    setOffset(dist);
  }

  const findScroll = () => {
    let scrollY = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    let scrollX = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scroll;
    let scrollValues = [0, 0];
    if (typeof scrollX == 'number' || typeof scrollY == 'number') {
      if (typeof scrollX == 'number') {
        scrollValues[0] = scrollX;
      }
      if (typeof scrollY == 'number') {
        scrollValues[1] = scrollY;
      }
      setScrolls(scrollValues);
    }
  }

  /* const findMapSize = () => {
    let mapImage = document.getElementById('opplastetKart');
    let newXsize = mapImage.width;
    let newYsize = mapImage.height;
    setMapSize([newXsize, newYsize]);
    // const [imgSize, setImgSize] = useState([0, 0]);
  }*/
  
  const rePlaceEvents = () => {
    let icon;
    // let coords;
   //  for (var i=0; i<iconInfoObjects.length; i++) {
      // console.log('i: ' + i);
      icon = document.getElementById(0);
      console.log(icon);
      let iconInfoObject = iconInfoObjects[0];
      // console.log(iconInfoObject.originalCoord);
      // console.log(iconInfoObject.originalSize);
      // coords = findNewCoord(iconInfoObject.originalSize, iconInfoObject.originalCoord);
      // icon.style.left = (coords[0] + 200) +'px';
      // icon.style.top =  (coords[1]) +'px';
      console.log('--------------')
    // }

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
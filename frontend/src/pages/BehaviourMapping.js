import React from 'react';
import AllIcons from '../components/AllIcons';
import Interview from '../components/interview';
import ContextMenu from '../components/ContextMenu';
import { Link } from 'react-router-dom';
import './BehaviourMapping.css';
import classNames from 'classnames';
import { Authenticated } from './auth/AuthContext';
import domtoimage from 'dom-to-image';

class BehaviourMapping extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        background: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
        imageUploaded: props.location.state.imageUploaded,
        
        iconObjects: [], 
        ourSRC: null,
        sendNewIconToBD: false,
        newIconID: 0,
        actionID: 0,
        ourIconID: 0,
        ourIconCoord: {x: 0, y: 0, degree: 0,},
        ourMouseCoord: {x: 0, y: 0,},
        
        
        // Perhaps collect all these into one object at a late time
        p_id: props.location.state.p_id,
        eventSize: 50,
        f_id: "",
        iconSRC: "",
        projdata: [],
        formerEvents: [],
        currentScreenSize: {x: 0, y: 0,},
        formerScreenSize: {x: 0, y: 0,},
        originalScreenSize: {x: 0, y: 0},
        mapblob: "",
        hideOrShow: "hide",
        arcGISfilename: "",
        scrollHorizontal: 0,
        scrollVertical: 0,
        onlyObservation: true,
        drawLine: false,
        addInterview: false,
        showContextMenu: false,
        coords: [],
        eightOfCoords: 0,
        interviews: [],
        i_ids: [],
        u_id: window.sessionStorage.getItem('uID'),
      };
      this.canvas = React.createRef();
      this.myImage = React.createRef();
      this.interviewElement = React.createRef();

      this.handleScroll = this.handleScroll.bind(this)
      // this.moveIcon = this.moveIcon.bind(this)
      this.handleResize = this.handleResize.bind(this);
      this.writeFilename = this.writeFilename.bind(this);
      this.selectIcon = this.selectIcon.bind(this);
      this.closeIconSelect = this.closeIconSelect.bind(this);
      this.newIcon = this.newIcon.bind(this);
      this.showAll = this.showAll.bind(this);
      this.hideAll = this.hideAll.bind(this);
      this.argCIS = this.argCIS.bind(this);
      this.changeMode = this.changeMode.bind(this);
      this.drawLine = this.drawLine.bind(this);
      this.addToDrawList = this.addToDrawList.bind(this);
      this.drawFunction = this.drawFunction.bind(this);
      this.addInterview = this.addInterview.bind(this);
      this.saveInterview = this.saveInterview.bind(this);
      this.finishProject = this.finishProject.bind(this);
      this.takeScreenshot = this.takeScreenshot.bind(this);
      this.changeSizeOfIcons = this.changeSizeOfIcons.bind(this);
      this.changeShowContextMenu = this.changeShowContextMenu.bind(this);
      this.selectItemForContextMenu = this.selectItemForContextMenu.bind(this);
  }

  createIconObject(coordinates, currentSize) {
    let icon = {
      originalCoord: coordinates,
      originalSize: currentSize,
    };
    this.setState({iconObjects: [...this.state.iconObjects, icon]}, function() {});
  }

  sendEventToDatabase() {
    // rettningen, xogykoordinat, tid, icon
    const data = new FormData();
    const coordinates = [this.state.ourIconCoord.x, this.state.ourIconCoord.y];
    const currentSize = [this.state.currentScreenSize.x, this.state.currentScreenSize.y];
    if (this.state.ourIconCoord.degree === undefined) {
      this.setState({ourIconCoord: { degree: "rotate(0deg)"}})
    }
    // this.createIconObject(coordinates, currentSize)
    data.append('p_id', this.state.p_id);
    data.append('direction', this.state.ourIconCoord.degree);
    data.append('center_coordinate', coordinates);
    data.append('created', new Date());
    data.append('f_id', this.state.f_id);
    data.append('icon_src', this.state.iconSRC);
    data.append('image_size', currentSize);
    data.append('u_id', this.state.u_id);

    fetch(window.backend_url +'addevent', {
    method: 'POST',
    body: data,
    })
  }

  updateCoord(event) {
    this.setState({
      ourMouseCoord: {
        x: event.clientX - 200,
        y: event.clientY,
      }
    });
  }

  newIcon() {
    this.hideAll();
    this.setState({ addIcon: !this.state.addIcon });
    this.setState({showContextMenu: false});
  }

  setInnerHTML(str) {
    if (str != null) {
      let descr = str.split(' ');
      descr[0] = descr[0].charAt(0).toUpperCase() + descr[0].slice(1);
      for (let i=1; i<descr.length-2; i++) {
        descr[0] += " " + descr[i]
      }
      switch(descr[descr.length-2]) {
        case 'blue':
          descr[1] = "Man";
          break;
        case 'red':
          descr[1] = "Woman";
          break;
        case 'green':
          descr[1] = "Child";
          break;
          case 'yellow':
          descr[1] = "Group";
          break;
        default:
          break;
      }
      let innerHTML = descr[0] + ": " + descr[1];
      return innerHTML; 
    }
  }

  selectIcon(e) {
    let newSrc = e.target.src;
    if (e.target.getAttribute('id') !== null) {
      let imgIdSplit = e.target.getAttribute('id').split(' ')
      this.setState({f_id: imgIdSplit[imgIdSplit.length - 1 ]});
    } else if (e.target.children[0].getAttribute('id') !== null ) {
      let imgIdSplit = e.target.children[0].getAttribute('id').split(' ')
      this.setState({f_id: imgIdSplit[imgIdSplit.length - 1]});
    }
    this.setState({iconSRC: newSrc});      
    this.setState({ourSRC: newSrc});
    this.hideIcon()
    this.closeIconSelect()
  }

  objectExists(newText) {
    if (newText === undefined) {
      return false;
    }
    return true;
  }

  alreadyInList(newText, list) {
    let ele = list.getElementsByTagName('li')
    for (let i = 0; i < ele.length; i ++) {
      if (ele[i].innerHTML === newText) {
        return true;
      }
    }
    return false;
  }

  takeAction(event) {
    if (this.state.ourSRC !== null && this.state.addIcon === false) {
      if (this.state.actionID === 0) {
        this.placeIcon(event);
        this.setState({sendNewIconToBD: true}, function() {});
        this.startPointing();
      } else {
        this.pointIcon();
      }
    }
  }

  placeIcon(event) {
    this.findScreenSize()
    var img = document.createElement('img');
    img.src = this.state.ourSRC;
    img.classList.add('icon');
    img.style.height = this.state.eventSize + "px";
    img.style.width = this.state.eventSize + "px";
    img.setAttribute('id', this.state.newIconID.toString());
    this.setState({
      ourIconID: this.state.newIconID
    }, function() {});
    this.setState({
      newIconID: this.state.newIconID + 1
    }, function() {} );
    document.getElementById('icon-container').appendChild(img);
    let coordinates = [event.clientX - (this.state.eventSize / 2), event.clientY - (this.state.eventSize / 2)];
    let scrollHorizontal = this.state.scrollHorizontal;
    let scrollVertical = this.state.scrollVertical;
    if (typeof scrollHorizontal === 'number' && scrollHorizontal !== 0) {
      coordinates[0] = coordinates[0] + scrollHorizontal;
    }
    if (typeof scrollVertical === 'number' && scrollVertical !== 0) {
      coordinates[1] = coordinates[1] + scrollVertical;
    }
    img.style.left = coordinates[0] +'px';
    img.style.top =  coordinates[1] +'px';
    let imageSizeOnCreation = [this.state.currentScreenSize.x, this.state.currentScreenSize.y];
    this.createIconObject(coordinates, imageSizeOnCreation);
    this.setState({
      ourIconCoord: {
        x: coordinates[0] - 200,
        y: coordinates[1],
      }
    }, function() {});
    // this.addListenerToImage(img);
    this.findScreenSize();
  }

 pointIcon() {
    var degreerot = Math.atan2(
        this.state.ourMouseCoord.x - this.state.ourIconCoord.x,
        -(this.state.ourMouseCoord.y - this.state.ourIconCoord.y),
    ); 
    var degrees = degreerot*180/Math.PI - 90;
    var round_degree = Math.round(degrees);
    var string_degree = 'rotate(' + round_degree.toString() +'deg)';
   
    this.setState({
      ourIconCoord: {
        x: this.state.ourIconCoord.x,
        y: this.state.ourIconCoord.y,
        degree: string_degree
      }
    });
    var img = document.getElementById(this.state.ourIconID.toString());
    if (string_degree != null) {
      img.style.transform = string_degree;
    }
  }

  startPointing() {
    this.setState({
      actionID: 1,
    });
  }

  stopPointing() {
    this.setState({
      actionID: 0,
    });
    if (this.state.sendNewIconToBD) {
      this.sendEventToDatabase();
      this.setState({sendNewIconToBD: false}, function() {});
    }
  }

  hideIcon() {
    var icon = document.getElementById(this.state.ourIconID.toString())
    if (icon != null) {
      icon.style.display = 'none';
    }
    this.stopPointing()
  }

  showAll() {
    this.stopPointing()
    var icon;
    for (var i=0; i<this.state.newIconID; i++) {
      icon = document.getElementById(i.toString());
      icon.style.display = 'block';
    }
  }

  hideAll() {
    this.stopPointing()
    var icon;
    for (var i=0; i<this.state.newIconID; i++) {
      icon = document.getElementById(i.toString());
      icon.style.display = 'none';
    }
  }

  closeIconSelect() {
    //this.hideAll()
    if (this.state.addIcon) {
      this.setState({ addIcon: false});
    }  
  }
  
  // addListenerToImage(img) {
  //   img.addEventListener('click', function() {
  //     if (img.style.border === '4px solid red') {
  //       img.style.border = 'none';
  //       img.style.borderRadius = '5px';
        
  //       // let iconInfo = this.state.iconObjects[id];
  
  //       // let coords = this.findNewCoordinates(iconInfo.originalSize, iconInfo.originalCoord);
  //       // icon.style.left = (coords[0] + 200) +'px';
  //       // icon.style.top =  (coords[1]) +'px';
  //     } else {
  //       img.style.border = '4px solid red';
  //     }
  //   });
  //   img.click();
  // }

  /* letImgDrop(ev) {
    ev.preventDefault();
  }*/
  
  
  /*dropImg(ev) {
    // console.log(ev.target.getAttribute('id'));
    console.log(this.state.ourMouseCoord);
    document.getElementById()
  }*/
  

  setScreenSize() {
    let nw = document.querySelector('.map-image').naturalWidth;
    let nh = document.querySelector('.map-image').naturalHeight;
    let mapImage = document.querySelector('.map-image');
    mapImage.height = nh;
    mapImage.width = nw;
  }

  findScreenSize() {
    // this.stopPointing()
    let mapImage = document.querySelector('.map-image');
    this.setState({
      currentScreenSize: {
        x: mapImage.width,
        y: mapImage.height,
      }
    }, function() {});
  }

  initiateFormerScreenSize() {
    this.stopPointing();
    let mapImage = document.querySelector('.map-image');
    this.setState({
      formerScreenSize: {
        x: mapImage.width,
        y: mapImage.height,
      }
    }, function() {});
  }

  handleResize() {
    if (this.state.formerEvents !== []) {
      if (this.state.currentScreenSize.x !== 0) {
        this.findScreenSize();
        // if (this.state.currentScreenSize.x != this.state.formerScreenSize.x || ) {
        this.placeEventsAfterChange()
        // }
        this.setState({formerScreenSize: this.state.currentScreenSize});
      }
    }
  }

  findNewCoordinates(oldSize, coords) {
    let percentx = coords[0] / oldSize[0];
    let percenty = coords[1] / oldSize[1];
    let mapImage = document.querySelector('.map-image');
    let newXsize = mapImage.width;
    let newYsize = mapImage.height;
    let newXcoord = newXsize * percentx;
    let newYcoord = newYsize * percenty;
    let newccords = [];
    newccords[0] = newXcoord;
    newccords[1] = newYcoord;
    return newccords;
  }

  placeEventsAfterChange() {
    let icon;
    for (var i=0; i<this.state.newIconID; i++) {
      icon = document.getElementById(i.toString());
      let iconInfo = this.state.iconObjects[i];

      let coords = this.findNewCoordinates(iconInfo.originalSize, iconInfo.originalCoord);
      icon.style.left = (coords[0] + 200) +'px';
      icon.style.top =  (coords[1]) +'px';
    }
  }

  changeMode() {
    this.stopPointing();
    this.setState({onlyObservation: !this.state.onlyObservation});
    this.setState({addIcon: false});
    this.setState({addInterview: false});
  }

  addInterview(whichInterview=0) {
    if (whichInterview > 0) {
      this.interviewElement.current.setState({alreadySaved: true});
      this.interviewElement.current.setInterview(this.state.interviews[whichInterview-1])
      if (!this.state.addInterview) {
        this.setState({addInterview: !this.state.addInterview});
      }
    } else {
      this.interviewElement.current.clearInterview();
      this.interviewElement.current.setState({alreadySaved: false})
      this.setState({addInterview: !this.state.addInterview});
    }
    
  }

  saveInterview(e) {
    e.preventDefault();
    let list = document.getElementsByClassName('interview-sidebar-li')[0];
    let li = document.createElement('li');

    let interviewNumber = this.state.interviews.length + 1;
    let newText = "Interview number: " + interviewNumber;
    
    if (this.objectExists(newText) === true) {
      this.setState({interviews: [...this.state.interviews, e.target.form.childNodes[1].value]});
      this.interviewElement.current.clearInterview();
      this.sendInterviewToDb(this.interviewElement.current.state.interview);
      
      li.innerHTML = newText;
      li.addEventListener('click', (e) => {
        this.addInterview(e.target.innerText[e.target.innerText.length - 1]);
      });
      list.appendChild(li);

      this.addInterview();
    }
  }

  sendInterviewToDb(interviewData) {
    const data = new FormData();
    const interview = interviewData;
    const p_id = this.state.p_id;
    data.append('interview', interview);
    data.append('p_id', p_id);
    data.append('u_id', this.state.u_id);
    fetch(window.backend_url + 'addinterview', {
      method: 'POST',
      body: data,
      })
    //   .then((res) => {
    //     res.json().then((data) => {
    //       // most likely not needed, can just use interviewnumber to get the correct text.
    //      this.setState({i_ids: [...this.state.i_ids, data.i_id[0]]});
    //     });
    // });
  }

  drawLine() {
    this.setState({drawLine: true});
  }

  addToDrawList(e) {
    // kjører hver gang en flytter på touchen. 
    if (this.state.eightOfCoords === 0) {
      let currCoords = [(e["touches"][0].clientX - 200), (e["touches"][0].clientY ) ];
      this.setState({coords: [...this.state.coords, currCoords]});
    }
    this.oneEigthOfCoords();
  }

  oneEigthOfCoords() {
    if (this.state.eightOfCoords === 7 ) {
      this.setState({eightOfCoords: 0})
    } else {
      this.setState({eightOfCoords: this.state.eightOfCoords + 1})
    }
  }

  drawFunction(){
    if (this.state.coords.length <= 3 ) {
      return
    }
    const canvas = this.canvas.current;
    const ctx = canvas.getContext("2d");
    let lastTwoCoords = [this.state.coords[this.state.coords.length - 1][0], 
      this.state.coords[this.state.coords.length - 1][1],
      this.state.coords[this.state.coords.length - 3][0], 
      this.state.coords[this.state.coords.length - 3][1]];
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.moveTo(this.state.coords[0][0], this.state.coords[0][1]);
    for (let coord of this.state.coords) {
      ctx.lineTo(coord[0], coord[1]);
    }
    this.drawArrow(ctx, lastTwoCoords);
    ctx.stroke();
    this.setState({drawLine: false});
    this.setState({coords: []});
    
    // bruke litt samme metoder som gjort i mappingen for å få en ny linje hver gang og kunne vise alle og skjule alle linjer.
  }

  drawArrow(ctx, lastTwoCoords) {
    let degreerot = Math.atan2(
      lastTwoCoords[0] - lastTwoCoords[2],
      -(lastTwoCoords[1] - lastTwoCoords[3]),
    );
    let degrees = degreerot*180/Math.PI + 90;
    let angle1 = (degrees + 25) * (Math.PI / 180);
    let angle2 = (degrees - 25) * (Math.PI / 180);
    let bottomX = 15 * Math.cos(angle1);
    let bottomY = 15 * Math.sin(angle1);
    let topX = 15 * Math.cos(angle2);
    let topY = 15 * Math.sin(angle2);
    ctx.moveTo(lastTwoCoords[0] + bottomX, lastTwoCoords[1] + bottomY);
    ctx.lineTo(lastTwoCoords[0], lastTwoCoords[1]);
    ctx.lineTo(lastTwoCoords[0] + topX, lastTwoCoords[1] + topY);
  }

  handleScroll() {
    let scrollY = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    let scrollX = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scroll;
    if (typeof scrollY == 'number') {
      this.setState({scrollVertical: scrollY,
        // horizontal: this.state.scroll.horizontal,
      }, function() {});
    }
    if (typeof scrollX == 'number') {
      this.setState({scrollHorizontal: scrollX,
      }, function() {});
    }
  }


  loadFormerEvents(data) {
    let formerEvents = [];
    let i;
    for (i=0; i<data.length; i=i+2) {
      let currentevent = data[i];
      let img = data[i+1]
      let eventset = []
      eventset.push(currentevent)
      eventset.push(img)
      formerEvents.push(eventset)
    }
    this.setState({formerEvents: formerEvents}, function() {});
    this.iterateThroughFormerEvents()
  }

  iterateThroughFormerEvents() {
    for (let i=0; i<this.state.formerEvents.length; i++) {

      let eventset = this.state.formerEvents[i];
      let imageSizeOnCreation = this.findIntegerCoordinates(eventset[0][3]);
      var coord = this.findIntegerCoordinates(eventset[0][2])
      this.createIconObject(coord, imageSizeOnCreation);
      let rotation = eventset[0][1]
      let f_id = eventset[0][5]
      coord = this.findNewCoordinates(imageSizeOnCreation, coord);
      this.placeFormerEvent(f_id, coord, rotation);
    }
  }

  findIntegerCoordinates(coord) {
    coord = coord.split(",");
    coord[0] = parseInt(coord[0], 10);
    coord[1] = parseInt(coord[1], 10);
    return coord;
  }

  placeFormerEvent(f_id, coord, rotation) {
    let src;
    fetch(window.backend_url + `getimagefromID?f_id=${f_id}&u_id=${this.state.u_id}`)
    .then(result => result.blob())
    .then(images => {
      src = URL.createObjectURL(images)

      let img = document.createElement('img');
      img.setAttribute('id', this.state.newIconID.toString());
      // this.addListenerToImage(img);
      img.click();
      this.setState({
        newIconID: this.state.newIconID + 1
      }, function() {});   
      img.classList.add('icon');
      img.style.height = this.state.eventSize + "px";
      img.style.width = this.state.eventSize + "px";
      img.src = src;
      document.getElementById('icon-container').appendChild(img);
      img.style.top =  (coord[1])+'px';
      img.style.left = (coord[0]+200) +'px';
      if (rotation != null) {
        img.style.transform = rotation;
      }
    });
    return null;
  }

  argCIS() {
    this.stopPointing();
    const data = new FormData();
    const name = [this.state.name];
    const p_id = this.state.p_id;
    data.append('name', name);
    data.append('p_id', p_id);
    data.append('u_id', this.state.u_id)
    fetch(window.backend_url + 'createarcgis', {
      method: 'POST',
      body: data,
      })
      .then(response => response.blob())
      .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "shapefiles.zip";
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();    
        a.remove();
      });

    // setTimeout(() => this.downloadArcGIS(), 1500);    
  }

  hideOrShow() {
    let liElementHideOrShow = document.getElementById('hide-or-show');
    if (this.state.hideOrShow === 'hide') {
      this.setState({hideOrShow: 'show'});
      this.hideAll();
      liElementHideOrShow.innerHTML = "Show Icons"
    } else {
      this.setState({hideOrShow: 'hide'});
      this.showAll();
      liElementHideOrShow.innerHTML = "Hide Icons"
    }
  }

  writeFilename(event) { 
    const {value} = event.target;
    this.setState({
        arcGISfilename: value
    }, function() {})
  }
  changePosScreenshot(change) {
    let icon;
    let iconinfo;
    for (var i=0; i<this.state.newIconID; i++) {
      icon = document.getElementById(i.toString());
      iconinfo = this.state.iconObjects[i];
      let coord = iconinfo.originalCoord;
      icon.style.left = (coord[0] + change) + 'px'
      icon.style.top = (coord[1]) + 'px'
    }
  }

  
  takeScreenshot() {
    this.stopPointing();
    // event.preventDefault();
    this.showAll();
    this.changePosScreenshot(0);
    var node = document.querySelector('.screenshot-div');
    domtoimage.toPng(node).then(dataURI => this.dataURItoBlob(dataURI))
    .then(blob => {
      let name = this.state.projdata[1] + "_ss.png"
      let file = new File([blob], name, {lastModified: new Date().getTime(), type: "image/png"})
      const data = new FormData();
      data.append('file', file);
      data.append('p_id', this.state.p_id);
      data.append('u_id', window.sessionStorage.getItem('uID'));
      data.append('map', false);
      this.hideAll();
      this.changePosScreenshot(200);
      fetch(window.backend_url + 'upload', {
        method: 'POST',
        body: data,})
      }).catch(function (error) {
          console.error('oops, something went wrong!', error);
      });
    
  }

  // https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
  dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
  else
      byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
}

finishProject() {
  if (window.confirm("This action will end the mapping, and is irreversible. Continue?")) {
    let time = String(new Date());
  this.takeScreenshot();
  fetch(window.backend_url + `updateproject?p_id=${this.state.p_id}&u_id=${this.state.u_id}&enddate=${time}`);
  setTimeout(() => {
    window.location.href = "http://localhost:3000/behaviourmapper/startpage"
    // window.location.href = "https://www.ux.uis.no/behaviourmapper/startpage"
  }, 1500);
  }
}

changeSizeOfIcons(event) {
  if (event.target.textContent === "+") {
    this.setState({eventSize: this.state.eventSize + 5}, function () {
      for (var i=0; i<this.state.newIconID; i++) {
        let event = document.getElementById(i.toString());
        event.style.height = this.state.eventSize + "px";
        event.style.width = this.state.eventSize + "px";
        event.style.left = (parseFloat(event.style.left) -2.5) +'px';
        event.style.top =  (parseFloat(event.style.top) -2.5) +'px';
      }
    })
  } else if (event.target.textContent === "-") {
    if (this.state.eventSize > 0 ) {
      this.setState({eventSize: this.state.eventSize - 5}, function () {
        for (var j=0; j<this.state.newIconID; j++) {
          let event = document.getElementById(j.toString());
          event.style.height = this.state.eventSize + "px";
          event.style.width = this.state.eventSize + "px";
          event.style.left = (parseFloat(event.style.left) + 2.5) +'px';
          event.style.top =  (parseFloat(event.style.top) + 2.5) +'px';
        }
    })
      
    }
  }
}

changeShowContextMenu() {
  this.closeIconSelect();
  this.hideAll();
  this.setState({showContextMenu: !this.state.showContextMenu});
}

selectItemForContextMenu(e) {
  let list = document.getElementById('favorite-icon-list');
  let li = document.createElement('li');
  let newSrc, newText;
  ({ newSrc, newText } = this.getNewSrcAndText(e, newSrc, newText, li));
  if (this.alreadyInList(newText, list) === false && this.objectExists(newText) === true) {
    this.setEventlistenerAndAppendLi(li, newText, newSrc, list);
  } else if (this.alreadyInList(newText, list) === true && this.objectExists(newText) === true) {
    let elementToRemove = document.getElementById(newSrc)
    list.removeChild(elementToRemove);
  }
  this.setState({addIcon: false});
}


  setEventlistenerAndAppendLi(li, newText, newSrc, list) {
    li.innerHTML = newText;
    li.addEventListener('click', () => {
      this.setState({ ourSRC: li.getAttribute('id') });
      this.hideIcon();
    });
    this.setState({ ourSRC: newSrc }, function () { });
    this.hideIcon();
    list.appendChild(li);
    this.setState({
      imgIcon: li.getAttribute('id')
    });
  }

  getNewSrcAndText(e, newSrc, newText, li) {
    if (e.target.getAttribute('id') !== null) {
      let imgIdSplit = e.target.getAttribute('id').split(' ');
      this.setState({ f_id: imgIdSplit[imgIdSplit.length - 1] });
      newSrc = e.target.src;
      newText = this.setInnerHTML(e.target.getAttribute('id'));
      li.setAttribute('id', newSrc);
    } else if (e.target.children[0].getAttribute('id') !== null) {
      let imgIdSplit = e.target.children[0].getAttribute('id').split(' ');
      this.setState({ f_id: imgIdSplit[imgIdSplit.length - 1] });
      newSrc = e.target.children[0].src;
      newText = this.setInnerHTML(e.target.children[0].getAttribute('id'));
      li.setAttribute('id', newSrc);
    }
    return { newSrc, newText };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    this.findScreenSize();
    this.initiateFormerScreenSize();
    window.addEventListener('resize', this.handleResize);

    fetch(window.backend_url + `getprojectmapping?p_id=${this.state.p_id}&u_id=${this.state.u_id}`)
    .then(res => res.json())
    .then(data => {
      this.setState({projdata: data});
      if (data[8] !== null) {
        let os = this.findIntegerCoordinates(data[8])
        this.setState({originalScreenSize: {
          x: os[0],
          y: os[1],
        }});
      }
    });
    fetch(window.backend_url + `getmap?p_id=${this.state.p_id}&u_id=${this.state.u_id}`).then(res => res.blob())
      .then(images => {
        let image = URL.createObjectURL(images);
        this.setState({mapblob: image});

    });
    fetch(window.backend_url + `getevents?p_id=${this.state.p_id}&u_id=${this.state.u_id}`)
    .then(res => res.json())
    .then(data => {
      setTimeout(() => this.loadFormerEvents(data), 500);
    });

    // resize the canvas to fill map part of window dynamically
    var firstTime = 0;
    (function(canvas, image) {
      window.addEventListener('resize', resizeCanvas, false);
      
      function resizeCanvas() {
        canvas.width = window.innerWidth - 200;
        canvas.height = window.innerHeight;
        drawStuff(); 
      }
      resizeCanvas();
  
      function drawStuff() {
        let ctx = canvas.getContext("2d");
        if (firstTime === 0) {
          image.onload = () => {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          }
          firstTime++;
        } else {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
              // draw all lines again.
      }
    })(this.canvas.current, this.myImage.current);
  }


  render() {
    let imageClassList = classNames({
      'map-image': !this.state.imageUploaded,
      'uploaded-map-image': this.state.imageUploaded,
      'visible': this.state.onlyObservation,
      'invisible': !this.state.onlyObservation
    });
    let canvasClassList = classNames({
      'map-image': true,
      'invisible': this.state.onlyObservation,
      'visible': !this.state.onlyObservation
    });
    let interviewLiClassList = classNames({
      'interview-sidebar-li': true,
      'invisible': this.state.onlyObservation,
      'visible': !this.state.onlyObservation
    });
    let screenshotDivClassList = classNames({
      'screenshot-div': true,
      'visible': true
    });
    return (
      <Authenticated>
        <div id='maincont' >
          <div className="sidebar">
            <div className={this.state.addIcon ? "icons-visible" : "icons-invisible"}>
                <AllIcons 
                  selectIcon = {this.selectIcon} 
                  close={this.closeIconSelect}
                />
            </div> 
            <div className={this.state.addInterview ? "interview" : "invisible"}> 
              <Interview 
                close={this.addInterview}
                save={this.saveInterview}
                ref={this.interviewElement}
              />  
            </div>
            <div className={this.state.showContextMenu ? "icons-visible" : "invisible"}>
              <ContextMenu
                selectIcon={this.selectItemForContextMenu}
                close={this.changeShowContextMenu}
              />
            </div> 
              <ul id="icon-list" className={this.state.onlyObservation ? "visible" : "invisible"}>
                <li id='addEventLi' className="bigButtonLi" onClick={this.newIcon}>Add Event</li>               
                <li className="bigButtonLi">
                  <div>Change size of events</div>
                  <div className="changeSizeContainer">
                    <p className="changeSize" onClick={this.changeSizeOfIcons}>+</p>
                    <p className="changeSize" onClick={this.changeSizeOfIcons}>-</p>
                  </div>
                </li>
                <li className="buttonLi" onClick={this.showAll}>Show icons</li>
                <li className="buttonLi" onClick={this.hideAll}>Hide icons</li>
                <li className="buttonLi" onClick={this.changeShowContextMenu}>Choose favorite events</li>
                <ul id="favorite-icon-list">
                  <li><h2>Favorites</h2></li>
                </ul>
                {/* <li className="buttonLi" onClick={this.changeMode}>Change Mode</li> */}
                <li className="buttonLi finishProjectLi" onClick={this.finishProject}><p>Finish project</p></li>
                
              </ul>
              <ul className={interviewLiClassList}>
                <li className="buttonLi" onClick={this.addInterview}>Add Interview</li>
                <li className="buttonLi" onClick={this.drawLine}>Add line</li>
                <li className="buttonLi" onClick={this.changeMode}>Change Mode</li>
                <li id='finishProjectLi' className="buttonLi" onClick={this.finishProject}><Link to={"/startpage"}><p>Finish project</p></Link></li>
              </ul>
              
          </div>
          <div className={screenshotDivClassList}>
            <canvas 
              onTouchMove={this.state.drawLine ? this.addToDrawList : null}
              onTouchEnd={this.drawFunction}
              className={canvasClassList}
              ref={this.canvas}
            />
            <img alt="" onMouseMove={e => this.updateCoord(e)}
              id='map-image' 
              onClick={e => this.takeAction(e)} 
              className={imageClassList}
              src={this.state.mapblob}
              ref={this.myImage}
            />
            <div id="icon-container" />
          </div>
          

        </div>
      </Authenticated>
    );
  }
}

export default BehaviourMapping;
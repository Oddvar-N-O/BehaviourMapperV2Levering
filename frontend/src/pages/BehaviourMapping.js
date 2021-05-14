import React from 'react';
import AllIcons from '../components/AllIcons';
import Interview from '../components/Interview';
import AddComment from '../components/AddComment';
import ContextMenu from '../components/ContextMenu';
import './BehaviourMapping.css';
import classNames from 'classnames';
import { Authenticated } from './auth/AuthContext';
import domtoimage from 'dom-to-image';
import i18next from 'i18next';
import { withTranslation } from 'react-i18next';
import * as AiIcons from 'react-icons/ai';
import mappingNorsk from './images/mappingNorsk.png'
import mappingEnglish from './images/mappingEnglish.png'
import surveyNorsk from './images/surveyNorsk.png'
import surveyEnglish from './images/surveyEnglish.png'


class BehaviourMapping extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        background: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
        imageUploaded: props.location.state.imageUploaded,
        onlyObservation: props.location.state.onlyObservation,
        iconObjects: [], 
        ourSRC: null,
        sendIconToBD: false,
        newIconID: 0,
        actionID: 0,
        ourIconID: 0,
        ourIconCoord: {x: 0, y: 0, degree: 0,},
        ourMouseCoord: {x: 0, y: 0,},
        selectedEventID: null,
        
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
        hideOrShow: "mapping.showIcons",
        arcGISfilename: "",
        scrollHorizontal: 0,
        scrollVertical: 0,
        drawOnCanvas: false,
        chosenColorForDrawing: '#008000',
        activateOnMouseMove: false,
        chosenDrawingEvent: undefined,
        drawLine: false,
        addInterview: false,
        addComment: false,
        showContextMenu: false,
        coords: [],
        eightOfCoords: 0,
        currentInterviewObject: undefined,
        interviews: [],
        projectQuestions: "",
        comments: {},
        i_ids: [],
        u_id: window.sessionStorage.getItem('uID'),
        showHelperImage: false,
      };

      this.canvas = React.createRef();
      this.myImage = React.createRef();
      this.interviewElement = React.createRef();
      this.commentElement = React.createRef();

      this.handleScroll = this.handleScroll.bind(this)
      this.handleResize = this.handleResize.bind(this);
      this.writeFilename = this.writeFilename.bind(this);
      this.selectIcon = this.selectIcon.bind(this);
      this.closeIconSelect = this.closeIconSelect.bind(this);
      this.newIcon = this.newIcon.bind(this);
      this.showAll = this.showAll.bind(this);
      this.hideAll = this.hideAll.bind(this);
      this.argCIS = this.argCIS.bind(this);
      this.whichDrawingFunction = this.whichDrawingFunction.bind(this);
      this.activateDrawingOnCanvas = this.activateDrawingOnCanvas.bind(this);
      this.chooseColorForDrawing = this.chooseColorForDrawing.bind(this);
      this.addToDrawList = this.addToDrawList.bind(this);
      this.drawFunction = this.drawFunction.bind(this);
      this.addInterview = this.addInterview.bind(this);
      this.newInterviewee = this.newInterviewee.bind(this);
      this.finishProject = this.finishProject.bind(this);
      this.takeScreenshot = this.takeScreenshot.bind(this);
      this.removeIcon = this.removeIcon.bind(this);
      this.addListenerToImage = this.addListenerToImage.bind(this);
      this.interactWithEvent = this.interactWithEvent.bind(this);
      this.changeSizeOfIcons = this.changeSizeOfIcons.bind(this);
      this.changeShowContextMenu = this.changeShowContextMenu.bind(this);
      this.selectItemForContextMenu = this.selectItemForContextMenu.bind(this);
      this.addComment = this.addComment.bind(this);
      this.saveComment = this.saveComment.bind(this);
      this.closeAddComment = this.closeAddComment.bind(this);
      this.hideOrShowFunction = this.hideOrShowFunction.bind(this);
      this.showHelperImage = this.showHelperImage.bind(this);
  }

  createIconObject(coordinates, currentSize, id) {
    let icon = {
      id: id,
      originalCoord: coordinates,
      originalSize: currentSize,
    };
    this.setState({iconObjects: [...this.state.iconObjects, icon]}, function() {});
  }

  sendEventToDatabase() {
    const data = new FormData();
    const coordinates = [this.state.ourIconCoord.x, this.state.ourIconCoord.y];
    const currentSize = [this.state.currentScreenSize.x, this.state.currentScreenSize.y];
    if (this.state.ourIconCoord.degree === undefined) {
      this.setState({ourIconCoord: { degree: "rotate(0deg)"}})
    }

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
    this.setInnerHTML(e.target.getAttribute('id'))
    let newSrc
    if (e.target.getAttribute('id') !== null) {
      let imgIdSplit = e.target.getAttribute('id').split(' ')
      this.setState({f_id: imgIdSplit[imgIdSplit.length - 1 ]});
      newSrc = e.target.src;
    } else if (e.target.children[0].getAttribute('id') !== null ) {
      let imgIdSplit = e.target.children[0].getAttribute('id').split(' ')
      this.setState({f_id: imgIdSplit[imgIdSplit.length - 1]});
      newSrc = e.target.children[0].src;
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
        this.setState({sendIconToBD: true}, function() {});
        this.startPointing();
      } else if (this.state.actionID === 1){
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
    this.setState({selectedEventID: null});

    img.addEventListener('click', () => {
      this.showChosenIcon(img.getAttribute('id'));
    });
    
    this.setState({
      ourIconID: this.state.newIconID
    }, function() {});
    this.setState({
      newIconID: this.state.newIconID + 1
    }, function() {} );
    document.getElementById('icon-container').appendChild(img);
    let coordinates = [event.clientX - 200, event.clientY];
    let scrollHorizontal = this.state.scrollHorizontal;
    let scrollVertical = this.state.scrollVertical;
    if (typeof scrollHorizontal === 'number' && scrollHorizontal !== 0) {
      coordinates[0] = coordinates[0] + scrollHorizontal;
    }
    if (typeof scrollVertical === 'number' && scrollVertical !== 0) {
      coordinates[1] = coordinates[1] + scrollVertical;
    }

    img.style.left = coordinates[0] + 200 - (this.state.eventSize / 2) +'px';
    img.style.top =  coordinates[1] - (this.state.eventSize / 2) +'px';
    let imageSizeOnCreation = [this.state.currentScreenSize.x, this.state.currentScreenSize.y];
    this.createIconObject(coordinates, imageSizeOnCreation, img.getAttribute('id'));
    this.setState({
      ourIconCoord: {
        x: coordinates[0],
        y: coordinates[1],
      }
    }, function() {});
  }

  interactWithEvent(img) {
    if (img != null) {
      if (img.style.border === '4px solid red') {
        img.style.border = 'none';
        img.style.borderRadius = '5px';
        this.setState({ourIconID: img.getAttribute('id')})
      } else {
        img.style.border = '4px solid red';
      }
    }
  }

  addListenerToImage(img) {
    img.addEventListener('click', this.interactWithEvent(img));
  }

  pointIcon() {
    if (this.state.iconObjects.length > 0) {
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
      var img = document.getElementById(this.state.iconObjects[this.state.iconObjects.length -1].id);
      if (string_degree !== null && img !== null) {
        img.style.transform = string_degree;
      }
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
    if (this.state.sendIconToBD) {
      this.sendEventToDatabase();
      this.setState({sendIconToBD: false});
    }
  }

  hideIcon() {
    var icon = document.getElementById(this.state.ourIconID.toString())
    if (icon !== null && this.state.hideOrShow !== 'mapping.hideIcons') {
      icon.style.display = 'none';
    }
    this.stopPointing()
  }

  showAll() {
    var icon;
    for (var i=0; i<this.state.newIconID; i++) {
      icon = document.getElementById(i.toString());
      if (icon != null) {
        icon.style.display = 'block';
      }
    }
  }

  hideAll() {
    let icon;
    for (var i=0; i<this.state.newIconID; i++) {
      icon = document.getElementById(i.toString());
      if (icon != null) {
        icon.style.display = 'none';
      }
    }
  }

  closeIconSelect() {
    if (this.state.addIcon) {
      this.setState({ addIcon: false});
    }
    if (this.state.hideOrShow === 'Hide Figures') {
      this.showAll();
    }
  }

  setScreenSize() {
    let nw = document.querySelector('.map-image').naturalWidth;
    let nh = document.querySelector('.map-image').naturalHeight;
    let mapImage = document.querySelector('.map-image');
    mapImage.height = nh;
    mapImage.width = nw;
  }

  findScreenSize() {
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
        if (this.state.currentScreenSize.x !== this.state.formerScreenSize.x || this.state.currentScreenSize.y !== this.state.formerScreenSize.y ) {
          this.placeEventsAfterChange()
        }
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
    console.log('placeelementafterchange')
    let icon;
    let id;
    for (var i=0; i<this.state.newIconID; i++) {
      let iconInfo = this.state.iconObjects[i];
      id = iconInfo.id;
      icon = document.getElementById(id.toString());
      let coords = this.findNewCoordinates(iconInfo.originalSize, iconInfo.originalCoord);
      icon.style.left = (coords[0] + 200) +'px';
      icon.style.top =  (coords[1]) +'px';
    }
  }

  addInterview() {
      this.setState({addInterview: !this.state.addInterview});
    }

  newInterviewee() {
    if (window.confirm("This will clear and save all work for the current interviewee. \n\n Do you want to continue?")) {
      this.updateInterviewObjectInDb(this.interviewElement.current.state.interview);
      this.clearCanvas();
      this.sendInterviewObjectToDb(this.state.projectQuestions);
    }
  }
  
  clearCanvas() {
    let canvas = this.canvas.current;
    let image = this.myImage.current;
    let ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth - 200;
    canvas.height = window.innerHeight;
    ctx.drawImage(image, 0,0,canvas.width,canvas.height);
    this.interviewElement.current.clearInterview();
    this.clearDrawing();
  }

  sendInterviewObjectToDb(interviewData) {
    const data = new FormData();
    data.append('interview', interviewData);
    data.append('p_id', this.state.p_id);
    data.append('u_id', this.state.u_id);
    this.interviewElement.current.setInterview(interviewData);
    fetch(window.backend_url + 'addinterview', {
      method: 'POST',
      body: data,
      }).then(res => res.json()).then(data => {
        this.setState({currentInterviewObject: data.i_id[0]});
    });
  }

  updateInterviewObjectInDb(interviewData) {
    const data = new FormData();
    data.append('interview', interviewData);
    data.append('io_id', this.state.currentInterviewObject);
    data.append('u_id', this.state.u_id);
    fetch(window.backend_url + 'updateinterview', {
      method: 'POST',
      body: data,
      })
  }

  whichDrawingFunction(e) {
    if (e.target.innerText === "Add Line" || e.target.innerText === "Legg Til Linje" ) {
      this.setState({chosenDrawingEvent: "Line"})
    } else if (e.target.innerText === "Add Area" || e.target.innerText === "Legg Til Område" ) {
      this.setState({chosenDrawingEvent: "Area"})
    } else if (e.target.innerText === "Add Point" || e.target.innerText === "Legg Til Punkt" ) {
      this.setState({chosenDrawingEvent: "Point"})
    }
    this.setState({drawOnCanvas: true});
  }

  activateDrawingOnCanvas() {
      this.setState({activateOnMouseMove: true});
  }

  chooseColorForDrawing(event) {
    this.setState({chosenColorForDrawing: event.target.value})
  }

  addToDrawList(e) {
    if (e._reactName === "onTouchMove") {
      if (this.state.eightOfCoords === 0) {
        let currCoords = [(e["touches"][0].clientX - 200), (e["touches"][0].clientY ) ];
        this.setState({coords: [...this.state.coords, currCoords]});
      }
      this.oneEigthOfCoords();
    }
    else if (e._reactName === "onMouseMove" || e._reactName === "onTouchStart" ) {
      let currCoords = [(e.clientX - 200), (e.clientY ) ];
      this.setState({coords: [...this.state.coords, currCoords]});
    }
  }

  oneEigthOfCoords() {
    if (this.state.eightOfCoords === 7 ) {
      this.setState({eightOfCoords: 0})
    } else {
      this.setState({eightOfCoords: this.state.eightOfCoords + 1})
    }
  }

  drawFunction() {
    if (this.state.chosenDrawingEvent === "Line") {
      this.drawLineFunction();
    } else if (this.state.chosenDrawingEvent === "Area") {
      this.drawAreaFunction();
    } else if (this.state.chosenDrawingEvent === "Point") {
      this.drawPointFunction();
    }
  }

  drawLineFunction(){
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
    ctx.strokeStyle = this.state.chosenColorForDrawing;
    ctx.lineWidth = 2;
    ctx.moveTo(this.state.coords[0][0], this.state.coords[0][1]);
    for (let coord of this.state.coords) {
      ctx.lineTo(coord[0], coord[1]);
    }
    this.drawArrow(ctx, lastTwoCoords);
    ctx.stroke();
    this.sendInterviewFigureToDb();
  }

  drawAreaFunction(){
    if (this.state.coords.length <= 3 ) {
      return
    }
    const canvas = this.canvas.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = this.state.chosenColorForDrawing;
    ctx.lineWidth = 2;
    ctx.moveTo(this.state.coords[0][0], this.state.coords[0][1]);
    for (let coord of this.state.coords) {
      ctx.lineTo(coord[0], coord[1]);
    }
    ctx.closePath();
    ctx.stroke();
    this.sendInterviewFigureToDb();
  }

  drawPointFunction(){
    if (this.state.coords.length <= 0 ) {
      return
    }
    const canvas = this.canvas.current;
    const ctx = canvas.getContext("2d");
    let halfTheSize = 5 / 2
    ctx.fillStyle = this.state.chosenColorForDrawing;
    ctx.fillRect(this.state.coords[0][0] - halfTheSize, this.state.coords[0][1] - halfTheSize, 5, 5)
    this.sendInterviewFigureToDb();
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
  
  clearDrawing() {
    this.setState({drawOnCanvas: false});
    this.setState({activateOnMouseMove: false});
    this.setState({coords: []});
  }

  findCanvasSize() {
    let canvas = this.canvas.current;
    let width = canvas.width;
    let height = canvas.height;
    return [width, height]
  }

  sendInterviewFigureToDb() {
    const data = new FormData();
    if (this.state.chosenDrawingEvent === "Point") {
      data.append('points', this.state.coords[0]);
    } else {
      data.append('points', this.state.coords);
    }
    data.append('color', this.state.chosenColorForDrawing);
    data.append('type', this.state.chosenDrawingEvent);
    data.append('image_size', this.findCanvasSize());
    data.append('io_id', this.state.currentInterviewObject);
    data.append('u_id', this.state.u_id);
    fetch(window.backend_url + 'addinterviewfigure', {
      method: 'POST',
      body: data,
      })
    this.clearDrawing();
  }

  handleScroll() {
    let scrollY = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    let scrollX = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scroll;
    if (typeof scrollY == 'number') {
      this.setState({scrollVertical: scrollY,
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
      this.createIconObject(coord, imageSizeOnCreation, i);
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
  }

  hideOrShowFunction() {
    if (this.state.hideOrShow === 'mapping.showIcons') {
      this.setState({hideOrShow: 'mapping.hideIcons'}, function() {this.showAll();});
    } else if (this.state.hideOrShow === 'mapping.hideIcons') {
      this.setState({hideOrShow: 'mapping.showIcons'}, function() {this.hideAll();});
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
      iconinfo = this.state.iconObjects[i];
      if (iconinfo !== undefined) {
        icon = document.getElementById(iconinfo.id);
        let coord = iconinfo.originalCoord;
        if (icon != null) {
          icon.style.left = (coord[0] - (this.state.eventSize / 2) + change) + 'px'
          icon.style.top = (coord[1] - (this.state.eventSize / 2)) + 'px'
        }
      }
    }
  }
  
  takeScreenshot() {
    if (this.state.onlyObservation) {
      this.stopPointing();
      this.sendEventToDatabase();
      this.showAll();
    }
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
    if (!this.state.onlyObservation) {
      this.updateInterviewObjectInDb(this.interviewElement.current.state.interview);
      this.clearCanvas();
    }
    let time = String(new Date());
    this.takeScreenshot();
    fetch(window.backend_url + `updateiconsize?p_id=${this.state.p_id}&iconSize=${this.state.eventSize}`);
      setTimeout(() => {
        fetch(window.backend_url + `updateproject?p_id=${this.state.p_id}&u_id=${this.state.u_id}&enddate=${time}`);
          setTimeout(() => {
            this.props.history.push({pathname: "/startpage"})
            }, 1500);
      }, 200);
  }
}

changeSizeOfIcons(event) {
  if (event.target.textContent === "+") {
    this.setState({eventSize: this.state.eventSize + 5}, function () {
      for (var i=0; i<this.state.newIconID; i++) {
        let event = document.getElementById(i.toString());
        if (event !== null) {
          event.style.height = this.state.eventSize + "px";
          event.style.width = this.state.eventSize + "px";
          event.style.left = (parseFloat(event.style.left) -2.5) +'px';
          event.style.top =  (parseFloat(event.style.top) -2.5) +'px';
        }
      }
    })
  } else if (event.target.textContent === "-") {
    if (this.state.eventSize > 5 ) {
      this.setState({eventSize: this.state.eventSize - 5}, function () {
        for (var j=0; j<this.state.newIconID; j++) {
          let event = document.getElementById(j.toString());
          if (event !== null) {
            event.style.height = this.state.eventSize + "px";
            event.style.width = this.state.eventSize + "px";
            event.style.left = (parseFloat(event.style.left) + 2.5) +'px';
            event.style.top =  (parseFloat(event.style.top) + 2.5) +'px';
          }
        }
    })  
    }
  }
}

changeShowContextMenu() {
  this.hideIcon();
  this.closeIconSelect();
  this.setState({showContextMenu: !this.state.showContextMenu});
  if (this.state.hideOrShow === 'Hide') {
    this.showAll();
  }
}

selectItemForContextMenu(e) {
  let list = document.getElementById('favorite-icon-list');
  let li = document.createElement('li');
  let newSrc, newText, newF_id;
  ({ newSrc, newText, newF_id } = this.getNewSrcAndText(e, newSrc, newText, newF_id, li));
  if (this.alreadyInList(newText, list) === false && this.objectExists(newText) === true) {
    this.setEventlistenerAndAppendLi(li, newText, newSrc, newF_id, list);
  } else if (this.alreadyInList(newText, list) === true && this.objectExists(newText) === true) {
    let elementToRemove = document.getElementById(newSrc)
    list.removeChild(elementToRemove);
  }
  this.setState({addIcon: false});
}

  setEventlistenerAndAppendLi(li, newText, newSrc, newF_id, list) {
    li.innerHTML = newText;
    li.addEventListener('click', () => {
      this.hideIcon();
      this.setState({ ourSRC: li.getAttribute('id') });
      this.setState({f_id: newF_id})
    });
    this.setState({ ourSRC: newSrc });
    list.appendChild(li);
    this.setState({
      imgIcon: li.getAttribute('id')
    });
  }

  getNewSrcAndText(e, newSrc, newText, newF_id, li) {
    if (e.target.getAttribute('id') !== null) {
      let imgIdSplit = e.target.getAttribute('id').split(' ');
      newF_id = imgIdSplit[imgIdSplit.length - 1];
      newSrc = e.target.src;
      newText = this.setInnerHTML(e.target.getAttribute('id'));
      li.setAttribute('id', newSrc);
    } else if (e.target.children[0].getAttribute('id') !== null) {
      let imgIdSplit = e.target.children[0].getAttribute('id').split(' ');
      newF_id = imgIdSplit[imgIdSplit.length - 1];
      newSrc = e.target.children[0].src;
      newText = this.setInnerHTML(e.target.children[0].getAttribute('id'));
      li.setAttribute('id', newSrc);
    }
    return { newSrc, newText, newF_id};
  }

  findIconObjectOfOurID() {
    let iconObject;
    for (let i=0; i<this.state.iconObjects.length ;i++) {
      iconObject = this.state.iconObjects[i];
      
      if (iconObject.id === this.state.selectedEventID) {
        return i;
      }
    }
    return null;
  }

  removeIcon() {
    this.stopPointing();
    this.setState({actionID: 1})
    var icon = document.getElementById(this.state.selectedEventID);
    if (icon != null) {
      icon.remove();
      let i = this.findIconObjectOfOurID();
      
      this.removeFromIconObjects(i);
      this.setState({selectedEventID: null});
      
      const data = new FormData();
      data.append('p_id', this.state.p_id);
      data.append('u_id', this.state.u_id);
      data.append('number', i);
  
      fetch(window.backend_url +'deleteevent', {
        method: 'POST',
        body: data,
      })

      if (this.state.sendIconToBD === true) {
        this.setState({sendIconToBD: false});
      }  
    }
  }

  removeFromIconObjects(i) {
    let newIconObjects = [...this.state.iconObjects];
    if (newIconObjects.length > 1) {
      newIconObjects.splice(i, 1);
    } else {
      this.clearIconObjects();
    }
    this.setState({iconObjects: newIconObjects},
      function() {});
  }

  showChosenIcon(thisEvent) {
    this.setState({selectedEventID: thisEvent});
    this.setState({actionID: null});
    let iconObject;
    let icon;
    for (let i=0; i<this.state.iconObjects.length; i++) {
      iconObject = this.state.iconObjects[i]
      icon = document.getElementById(iconObject.id);
      if (icon != null) {
        if (iconObject.id === this.state.selectedEventID) {
          if (icon.style.border === '4px solid red'){
            icon.style.border = 'none';
            this.setState({selectedEventID: null});
          } else {
            icon.style.border = '4px solid red';
            icon.style.border = 'block';
          }
        } 
        else {
          icon.style.border = 'none';
        }
      }
    }
  }

  clearIconObjects() {
    this.setState({iconObjects: []}, function() {});
  }

  addComment() {
    this.stopPointing();
    this.setState({actionID: 1}, function() {})
    let whichEvent = this.state.selectedEventID
    if (this.state.comments[whichEvent] !== undefined) {
      this.commentElement.current.setState({alreadySaved: true});
      this.commentElement.current.setComment(this.state.comments[whichEvent])
      if (!this.state.addComment) {
        this.setState({addComment: !this.state.addComment});
      }
    } else if (whichEvent !== null) {
      this.commentElement.current.clearComment();
      this.commentElement.current.setState({alreadySaved: false})
      this.setState({addComment: !this.state.addComment});
    }
  }

  closeAddComment() {
    this.setState({addComment: false});
  }

  saveComment(e) {
    e.preventDefault();
    let commentsCopy = this.state.comments;
    commentsCopy[this.state.selectedEventID] = e.target.form.childNodes[1].value;
    this.setState({comments: commentsCopy});
    this.commentElement.current.clearComment();
    this.sendCommentToDb(this.commentElement.current.state.comment);
    this.closeAddComment();
  }

  sendCommentToDb(comment) {
    const data = new FormData();
    data.append('comment', comment);
    data.append('p_id', this.state.p_id);
    data.append('u_id', this.state.u_id);
    data.append('whichEvent', this.findIconObjectOfOurID());
    fetch(window.backend_url + 'updateeventwithcomment', {
      method: 'POST',
      body: data,
      })
  }

  showHelperImage() {
    if (this.state.showHelperImage) {
      this.setState({
        showHelperImage: false
      })
    } else {
      this.setState({
        showHelperImage: true
      })
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);

    this.findScreenSize();
    this.initiateFormerScreenSize();
    if (!this.state.onlyObservation) {
      fetch(window.backend_url + `getquestionsfromproject?p_id=${this.state.p_id}&u_id=${this.state.u_id}`)
      .then(res => res.json())
      .then(data => {
        this.setState({projectQuestions: data.questions});
        this.sendInterviewObjectToDb(data.questions);
      });
    }
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
    // fetch(window.backend_url + `getevents?p_id=${this.state.p_id}&u_id=${this.state.u_id}`)
    // .then(res => res.json())
    // .then(data => {
      // if (data.length > 0) {
      //   setTimeout(() => this.loadFormerEvents(data), 500);
      // }
    // });
    var firstTime = 0;
    (function(canvas, image) {
      window.addEventListener('resize', resizeCanvas, false);

      function resizeCanvas() {
        canvas.width = window.innerWidth - 200;
        canvas.height = window.innerHeight;
        drawMap(); 
      }
      resizeCanvas();

      function drawMap() {
        let ctx = canvas.getContext("2d");
        if (firstTime === 0) {
          image.onload = () => {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          }
          firstTime++;
        } else {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
      }
    })(this.canvas.current, this.myImage.current);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }


  render() {
    const { t } = this.props; // used for translation
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
            <div className={this.state.addInterview ? "textBox" : "invisible"}> 
              <Interview 
                close={this.addInterview}
                ref={this.interviewElement}
              />  
            </div>
            <div className={this.state.addComment ? "textBox" : "invisible"}> 
              <AddComment 
                close={this.closeAddComment}
                save={this.saveComment}
                ref={this.commentElement}
              />  
            </div>
            <div className={this.state.showContextMenu ? "icons-visible" : "invisible"}>
              <ContextMenu
                selectIcon={this.selectItemForContextMenu}
                close={this.changeShowContextMenu}
              />
            </div> 
              <ul id="icon-list" className={this.state.onlyObservation ? "visible" : "invisible"}>
                <li id='addEventLi' className="bigButtonLi" onClick={this.newIcon}>{t('mapping.addEvent')}</li>               
                <li className="bigButtonLi">
                  <div>{t('mapping.changeSize')}</div>
                  <div className="changeSizeContainer">
                    <p className="changeSize" onClick={this.changeSizeOfIcons}>+</p>
                    <p className="changeSize" onClick={this.changeSizeOfIcons}>-</p>
                  </div>
                </li>
                <li id="hide-or-show" className="buttonLi" onClick={this.hideOrShowFunction}> {t(this.state.hideOrShow)}</li>
                <li className="buttonLi" onClick={this.removeIcon}>{t('mapping.remove')}</li>
                <li className="buttonLi" onClick={this.addComment}>{t('mapping.addComment')}</li>
                <li className="buttonLi" onClick={this.changeShowContextMenu}>{t('mapping.chooseFavorite')}</li>
                <ul id="favorite-icon-list">
                </ul>
                <li id="finishProjectLi" className="buttonLi" onClick={this.finishProject}><p>{t('mapping.finishMapping')}</p></li>
              </ul>

              <ul id="interview-sidebar-li" className={interviewLiClassList}>
                <li className="buttonLi" onClick={this.newInterviewee}>{t('mapping.newInterviewee')}</li>
                <li className="buttonLi" onClick={this.addInterview}>{t('mapping.addInterview')}</li>
                <li className="buttonLi" onClick={this.whichDrawingFunction}>{t('mapping.addLine')}</li>
                <li className="buttonLi" onClick={this.whichDrawingFunction}>{t('mapping.addArea')}</li>
                <li className="buttonLi" onClick={this.whichDrawingFunction}>{t('mapping.addPoint')}</li>
                <li className="select">
                  <label>{t('mapping.color')}</label>
                  <select value={this.state.chosenColorForDrawing} onChange={this.chooseColorForDrawing}>
                    <option value="#008000">{t('mapping.green')}</option>
                    <option value="#ff0000">{t('mapping.red')}</option>
                    <option value="#000000">{t('mapping.black')}</option>
                  </select>
                </li>
                <li id="finishProjectLi" className="buttonLi" onClick={this.finishProject}><p>{t('mapping.finishMapping')}</p></li>
              </ul>
          </div>
          
          <div className={screenshotDivClassList}>
            <canvas 
              onTouchStart={this.state.drawOnCanvas ? this.activateDrawingOnCanvas : null}
              onTouchMove={this.state.activateOnMouseMove ? this.addToDrawList : null}
              onTouchEnd={this.drawFunction}
              onMouseDown={this.state.drawOnCanvas ? this.activateDrawingOnCanvas : null}
              onMouseMove={this.state.activateOnMouseMove ? this.addToDrawList : null}
              onMouseUp={this.drawFunction}
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
            <div className="help" onClick={this.showHelperImage}>
              <AiIcons.AiOutlineQuestionCircle/>
            </div>
            <div className={this.state.onlyObservation? "mapping-helper-image-wrapper" : "invisible"}>
              <div className={this.state.showHelperImage ? "helper-image-background" : "invisible"}
              onClick={this.showHelperImage} ></div>
              <img onClick={this.showHelperImage} 
              className={this.state.showHelperImage ? "helper-image" : "invisible"} 
              src={i18next.languages[0] === "en" ? mappingEnglish : mappingNorsk} 
              alt="HelperImage">
              </img>
            </div>
            <div className={this.state.onlyObservation? "invisible" : "mapping-helper-image-wrapper"}>
              <div className={this.state.showHelperImage ? "helper-image-background" : "invisible"}
              onClick={this.showHelperImage} ></div>
              <img onClick={this.showHelperImage} 
              className={this.state.showHelperImage ? "helper-image" : "invisible"} 
              src={i18next.languages[0] === "en" ? surveyEnglish : surveyNorsk} 
              alt="HelperImage">
              </img>
            </div>
        </div>
      </Authenticated>
    );
  }
}

export default withTranslation('common')(BehaviourMapping);
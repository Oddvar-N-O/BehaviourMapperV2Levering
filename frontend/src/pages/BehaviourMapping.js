import Corner from 'ol/extent/Corner';
import React from 'react';
import AllIcons from '../components/AllIcons';
import './BehaviourMapping.css'

class BehaviourMapping extends React.Component {
  constructor(props) {
      super(props)


      this.state = {
        background: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
        iconSRCs: [],
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
        scrollVertical: 0
      };
      this.canvasRef = React.createRef();
      this.handleScroll = this.handleScroll.bind(this)
      // this.moveIcon = this.moveIcon.bind(this)
      this.handleResize = this.handleResize.bind(this);

      this.selectIcon = this.addIconToList.bind(this)
      this.closeIconSelect = this.closeIconSelect.bind(this)
      this.writeFilename = this.writeFilename.bind(this);
  }

  createIconObject(coordinates, currentSize) {
    let icon = {
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
    console.log('SDB');
    // this.createIconObject(coordinates, currentSize)
    data.append('p_id', this.state.p_id);
    data.append('direction', this.state.ourIconCoord.degree);
    data.append('center_coordinate', coordinates);
    data.append('created', new Date());
    data.append('f_id', this.state.f_id);
    data.append('icon_src', this.state.iconSRC);
    data.append('image_size', currentSize);

    fetch('addevent', {
    method: 'POST',
    body: data,
    }).then((response) => {
    });
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
    this.setState({ addIcon: true })
  }

  setInnerHTML(str) {
    if (str != null) {
      let descr = str.split(' ');
     //  descr[0] = descr[0].charAt(0).toUpperCase() + descr[0].slice(1);
      switch(descr[1]) {
        case 'blue':
          descr[1] = "Man";
          break;
        case 'red':
          descr[1] = "Woman";
          break;
        default:
          descr[1] = "Child";
      }
      return descr;
    }
  }

  addIconToList(e) {
    let list = document.getElementById('iconList');
    let li = document.createElement('li');

    let newSrc = e.target.src;
    this.setState({iconSRCs: [...this.state.iconSRCs, newSrc]}, function() {
    });
    li.setAttribute('id', newSrc);
    let textArray = this.setInnerHTML(e.target.getAttribute('id'));
    let newText = textArray[0] + ": " + textArray[1]

    this.setState({ // not here
      f_id: textArray[textArray.length - 1]
    });
    this.setState({
      iconSRC: newSrc
    });      
    let foundObject = this.objectExists(newText);
    let alreadyExists = this.alreadyInList(newText, list)

    if (alreadyExists === false && foundObject === true) {
      li.innerHTML = newText;
      // vi bytter og skjuler, og sikrer oss at knappene kan gjøre det
      
      li.addEventListener('click', () => {
        this.setState({ourSRC: li.getAttribute('id')}, function() {});
        this.hideIcon()
      });
      this.setState({ourSRC: newSrc}, function() {});
      this.hideIcon()
  
      list.appendChild(li);
      this.setState({
        imgIcon: li.getAttribute('id')
      });
      this.closeIconSelect()
    } else if (alreadyExists === false && foundObject === false) {
      this.closeIconSelect();
    } else {
      this.closeIconSelect();
    }
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

 pointIcon() {
    // Finn grad
    var degreerot = Math.atan2(
        this.state.ourMouseCoord.x - this.state.ourIconCoord.x,
        -(this.state.ourMouseCoord.y - this.state.ourIconCoord.y),
    ); // our target is the mouse substracted by iconlocation
    // the second param is the Y dir
    var degrees = degreerot*180/Math.PI - 90;
    var round_degree = Math.round(degrees);
    var string_degree = 'rotate(' + round_degree.toString() +'deg)';
    // this.state.ourIconCoord.degree = string_degree;
    this.setState({
      ourIconCoord: {
        x: this.state.ourIconCoord.x,
        y: this.state.ourIconCoord.y,
        degree: string_degree
      }
    });
    // point icon with css
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
  
  addListenerToImage(img) {
    console.log('start');
    img.addEventListener('click', function() {
      if (img.style.border == '4px solid red') {
        img.style.border = 'none';
        img.style.borderRadius = '5px';
        let id = img.getAttribute('id');
        
        // let iconInfo = this.state.iconObjects[id];
  
        // let coords = this.findNewCoordinates(iconInfo.originalSize, iconInfo.originalCoord);
        // icon.style.left = (coords[0] + 200) +'px';
        // icon.style.top =  (coords[1]) +'px';
      } else {
        img.style.border = '4px solid red';
      }
    });
    img.click();
  }

  /* letImgDrop(ev) {
    ev.preventDefault();
  }*/
  
  
  /*dropImg(ev) {
    // console.log(ev.target.getAttribute('id'));
    console.log(this.state.ourMouseCoord);
    document.getElementById()
  }*/

  placeIcon(event) {
    this.findScreenSize()
    var img = document.createElement('img');
    img.src = this.state.ourSRC;
    img.classList.add('icon');
    img.setAttribute('id', this.state.newIconID.toString());
    this.setState({
      ourIconID: this.state.newIconID
    }, function() {});
    this.setState({
      newIconID: this.state.newIconID + 1
    }, function() {} );
    document.getElementById('iconContainer').appendChild(img);
    let coordinates = [event.clientX - 225, event.clientY - 20];
    let scrollHorizontal = this.state.scrollHorizontal;
    let scrollVertical = this.state.scrollVertical;
    if (typeof scrollHorizontal == 'number' && scrollHorizontal != 0) {
      coordinates[0] = coordinates[0] + scrollHorizontal;
    }
    if (typeof scrollVertical == 'number' && scrollVertical != 0) {
      coordinates[1] = coordinates[1] + scrollVertical;
    }
    img.style.left = coordinates[0] + 200 +'px';
    img.style.top =  coordinates[1] +'px';
    let imageSizeOnCreation = [this.state.currentScreenSize.x, this.state.currentScreenSize.y];
    this.createIconObject(coordinates, imageSizeOnCreation);
    this.setState({
      ourIconCoord: {
        x: coordinates[0],
        y: coordinates[1],
      }
    }, function() {});
    this.addListenerToImage(img);
    this.findScreenSize();
  }
  

  setScreenSize() {
    let nw = document.querySelector('.map-image').naturalWidth;
    let nh = document.querySelector('.map-image').naturalHeight;
    let mapImage = document.querySelector('.map-image');
    mapImage.height = nh;
    mapImage.width = nw;
  }

  findScreenSize() {
    this.stopPointing()
    let mapImage = document.querySelector('.map-image');
    this.setState({
      currentScreenSize: {
        x: mapImage.width,
        y: mapImage.height,
      }
    }, function() {});
  }

  initiateFormerScreenSize() {
    this.stopPointing()
    let mapImage = document.querySelector('.map-image');
    this.setState({
      formerScreenSize: {
        x: mapImage.width,
        y: mapImage.height,
      }
    }, function() {});
  }

  handleResize() {
    if (this.state.formerEvents != []) {
      if (this.state.currentScreenSize.x != 0) {
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
  
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    this.findScreenSize(); // currentScreenSize.x and .y
    this.initiateFormerScreenSize();
    window.addEventListener('resize', this.handleResize);
    // const canvas = this.canvasRef.current;
    // const ctx = canvas.getContext('2d')

    fetch(`getprojectmapping?p_id=${this.state.p_id}`)
    .then(res => res.json())
    .then(data => {
      this.setState({projdata: data});
      let os = this.findIntegerCoordinates(data[8])
      this.setState({originalScreenSize: {
        x: os[0],
        y: os[1],
      }});
    });
    fetch(`getmap?p_id=${this.state.p_id}`).then(res => res.blob())
      .then(images => {
        let image = URL.createObjectURL(images);
        this.setState({mapblob: image});
        /* var background = new Image();
        background.src = "http://www.samskirrow.com/background.png";
        background.onload = function(){
            ctx.drawImage(background,0,0);   
        }*/

    });
    fetch(`getevents?p_id=${this.state.p_id}`)
    .then(res => res.json())
    .then(data => {
      setTimeout(() => this.loadFormerEvents(data), 500);
    });
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



  fillSquare() {
    var canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, canvas.width, canvas.height);
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

  iterateThroughFormerEvents() { // tried async + await
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
    fetch(`getimagefromID?f_id=${f_id}`)
    .then(result => result.blob())
    .then(images => {
      src = URL.createObjectURL(images)

      let img = document.createElement('img');
      img.setAttribute('id', this.state.newIconID.toString());
      this.addListenerToImage(img);
      img.click();
      this.setState({
        newIconID: this.state.newIconID + 1
      }, function() {});   
      img.classList.add('icon');
      img.src = src;
      document.getElementById('iconContainer').appendChild(img);
      img.style.top =  (coord[1])+'px';
      img.style.left = (coord[0]+200) +'px';
      if (rotation != null) {
        img.style.transform = rotation;
      }
    });
    return null;
  }

  createArgCIS() {
    const data = new FormData();
    const name = [this.state.name];
    const p_id = this.state.p_id;
    data.append('name', name);
    data.append('p_id', p_id);
    /*
     fetch(`getevents?p_id=${this.state.p_id}`)
    .then(res => res.json())
    .then(data => {
      setTimeout(() => this.loadFormerEvents(data), 500);
    });
     */
    fetch('createarcgis', {
      method: 'POST',
      body: data,
      })
      .then(response => response.text())
      .then(textString => {
        console.log(textString);
      });
      /* .then(blob => {
        console.log(blob);
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "requirements.txt";
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();    
        a.remove();
      });*/

    // setTimeout(() => this.downloadArcGIS(), 1500);    
  }

  /* downloadArcGIS() {
    fetch('exportarcgis')
    .then(res => res.blob())
    .then(blob => {
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = "filename.txt";
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();    
      a.remove();
      // alert('your file has downloaded!');
      /* blob.lastModifiedDate = new Date();
      blob.name = this.state.projectName + ".png";
      var file = new File([blob], blob.name, { lastModified: new Date().getTime(), type: blob.type })
      console.log(file);*/
  //  })
  //} 

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

  imgCanvas() {
    var canvas = document.getElementById('viewport'),
    context = canvas.getContext('2d');

    var base_image = new Image();
    base_image.src = 'img/base.png';
    context.drawImage(base_image, 100, 100);
  }

  changeThing() {
    // let dis = document.getElementById('map-image').style.display;
    if (document.getElementById('map-image').style.display !== 'none') {
      document.getElementById('map-image').style.display = 'none';
      document.getElementById('iconContainer').style.display = 'none';
      document.getElementById('canvas').style.display = 'inline-block';
    } else {
      document.getElementById('map-image').style.display = 'inline-block';
      document.getElementById('iconContainer').style.display = 'inline-block';
      document.getElementById('canvas').style.display = 'none';
    }
  }


  render() {
    return (
      <div id='maincont'>
        <div className="sidebar">
          <div className={this.state.addIcon ? "icons-visible" : "icons-invisible"}>
              <AllIcons selectIcon = {this.selectIcon} 
              close={() => this.closeIconSelect()}/>
            </div>  
              <ul id="iconList">
                <li className="buttonLi" onClick={() => this.newIcon()}>Add Event</li>
                <li id="hide-or-show" className="buttonLi" onClick={() => this.hideOrShow()}>Hide Icons</li>
                <li className="buttonLi" onClick={() => this.createArgCIS()}>Export to ArcGIS</li>
                <li className="buttonLi" onClick={() => this.findScreenSize()}>Sjekk SkjermStørrelse</li>
                <li className="buttonLi" onClick={() => this.changeThing()}>Change</li>
                <li className="buttonLi" onClick={() => this.manuallyResize()}>Manually Resize</li>
                <li id="input-li">
                  <textarea 
                    id="arcis-filename"
                    name="arcis-filename" 
                    value={this.state.arcGISfilename} 
                    placeholder="shapefile" 
                    onChange={this.writeFilename}
                  />
                </li>
              </ul>
        </div>
        <img alt="" onMouseMove={e => this.updateCoord(e)}
            id='map-image' 
            onClick={e => this.takeAction(e)}
            className='map-image' 
            src={this.state.mapblob} />
        <div id="iconContainer" />
        <canvas id="canvas" ref={this.canvasRef} onClick={(e) => this.fillSquare(e)}></canvas>
        <a id="download" href="" download></a>
      </div>
    );
  }
}// <AllIcons closeIconSelect = {this.closeIconSelect} />

export default BehaviourMapping;
import React from 'react';
import AllIcons from '../components/AllIcons';
import Interview from '../components/interview';
import './BehaviourMapping.css';
import classNames from 'classnames';

class BehaviourMapping extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        background: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
        icons: [],
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
        mapblob: "",
        onlyObservation: true,
        drawLine: false,
        addInterview: false,
        coords: [],
        eightOfCoords: 0,
      };
      this.canvas = React.createRef();
      this.myImage = React.createRef();

      this.selectIcon = this.addIconToList.bind(this);
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
  }



  sendDatabaseEvent() {
    // rettningen, xogykoordinat, tid, icon
    const data = new FormData();
    const coordinates = [this.state.ourIconCoord.x, this.state.ourIconCoord.y];
    if (this.state.ourIconCoord.degree === undefined) {
      this.setState({ourIconCoord: { degree: "rotate(0deg)"}})
    }
    data.append('p_id', this.state.p_id);
    data.append('direction', this.state.ourIconCoord.degree);
    data.append('center_coordinate', coordinates);
    data.append('created', new Date());
    // change this
    data.append('f_id', this.state.f_id);
    data.append('icon_src', this.state.iconSRC);
    // console.log(data);

    fetch('addevent', {
    method: 'POST',
    body: data,
    }).then((response) => {
      // console.log(response);
    });
  }

  updateCoord(event) {
    this.setState({
      ourMouseCoord: {
        x: event.clientX - 200,
        y: event.clientY,
      }
    });
    // console.log(this.state.ourMouseCoord)
  }

  newIcon() {
    this.hideIcon();
    this.setState({ addIcon: true })
  }

  setInnerHTML(str) {
    if (str != null) {
      let descr = str.split(' ');
      descr[0] = descr[0].charAt(0).toUpperCase() + descr[0].slice(1);
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
      // console.log(descr);
      let innerHTML = descr[0] + ": " + descr[1];
      // console.log(innerHTML);
      return innerHTML; 
    }
    return console.error("Prøv på Nytt");
  }

  addIconToList(e) {
    let list = document.getElementById('icon-list');
    let li = document.createElement('li');

    let newSrc = e.target.src;
    this.setState({icons: [...this.state.icons, newSrc]}, function() {
    });
    li.setAttribute('id', newSrc);
    let newText = this.setInnerHTML(e.target.getAttribute('id'));
    this.setState({
      f_id: newText
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
      alert('Error Loading from DB, please try again!');
      this.closeIconSelect();
    } else {
      alert('This icon already exists in the list!');
      this.closeIconSelect();
    }
  }

  objectExists(newText) {
    if (newText === undefined) {
      console.log("undefined!")
      return false;
    }
    return true;
  }

  alreadyInList(newText, list) {
    let ele = list.getElementsByTagName('li')
    // console.log(ele);
    for (let i = 0; i < ele.length; i ++) {
      // console.log(ele[i])
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
    var img = document.createElement('img');
    img.src = this.state.ourSRC;
    img.classList.add('icon');
    img.setAttribute('id', this.state.newIconID.toString());
    this.setState({
      ourIconID: this.state.newIconID
    });
    this.setState({
      newIconID: this.state.newIconID + 1
    });
    document.getElementById('icon-container').appendChild(img);
    img.style.top =  (event.clientY-20)+'px';
    img.style.left = (event.clientX-25) +'px';
    var x = event.clientX - 200;
    var y = event.clientY;
    this.setState({
      ourIconCoord: {
        x: x-20,
        y: y-25,
      }
    }, function() {});
    // this.getScreenSize();
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
      this.sendDatabaseEvent();
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
      // console.log('id ' + i);
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
    if (this.state.addIcon) {
      this.setState({ addIcon: false});
    }  
  }

  argCIS() {
    const data = new FormData();
    const name = [this.state.name];
    const p_id = this.state.p_id;
    data.append('name', name);
    data.append('p_id', p_id);
    fetch('createarcgis', {
      method: 'POST',
      body: data,
      }).then((response) => {
      });
  }

  changeMode() {
    this.setState({onlyObservation: !this.state.onlyObservation});
  }
  addInterview() {
    console.log(this.state.addInterview)
    this.setState({addInterview: !this.state.addInterview});
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



  componentDidMount() {
    fetch(`getprojectmapping?p_id=${this.state.p_id}`)
    .then(res => res.json())
    .then(data => {
      this.setState({projdata: data});
    });
    fetch(`getmap?p_id=${this.state.p_id}`).then(res => res.blob())
      .then(images => {
        let image = URL.createObjectURL(images);
        this.setState({mapblob: image});
    });
    fetch(`getevents?p_id=${this.state.p_id}`)
    .then(res => res.json())
    .then(data => {
      this.setState({formerEvents: data});
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
      'map-image': true,
      'visible': this.state.onlyObservation,
      'invisible': !this.state.onlyObservation
    });
    let canvasClassList = classNames({
      'map-image': true,
      'invisible': this.state.onlyObservation,
      'visible': !this.state.onlyObservation
    });
    return (
      <div id='maincont'>
        <div className="sidebar">
          <div className={this.state.addIcon ? "icons-visible" : "icons-invisible"}>
              <AllIcons selectIcon = {this.selectIcon} 
              close={() => this.closeIconSelect()}/>
          </div> 
          <div className={this.state.addInterview ? "interview" : "invisible"}> <Interview/> </div> 
            <ul id="icon-list" className={this.state.onlyObservation ? "visible" : "invisible"}>
              <li className="buttonLi" onClick={this.newIcon}>Add Event</li>
              <li className="buttonLi" onClick={this.showAll}>Show icons</li>
              <li className="buttonLi" onClick={this.hideAll}>Hide icons</li>
              <li className="buttonLi" onClick={this.argCIS}>ArcGIS</li>
              <li className="buttonLi" onClick={this.changeMode}>Change Mode</li>
            </ul>
            <ul className={this.state.onlyObservation ? "invisible" : "visible"}>
              <li className="buttonLi" onClick={this.addInterview}>Add Interview</li>
              <li className="buttonLi" onClick={this.drawLine}>Add line</li>
              <li className="buttonLi" onClick={this.changeMode}>Change Mode</li>
            </ul>
        </div>
        
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
    );
  }
}

export default BehaviourMapping;
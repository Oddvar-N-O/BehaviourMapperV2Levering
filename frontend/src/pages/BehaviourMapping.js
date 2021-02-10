import React from 'react';
import AllIcons from '../components/AllIcons';
import './BehaviourMapping.css'

class BehaviourMapping extends React.Component {
  constructor(props) {
      super(props)


      this.state = {
        background: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
        icons: [
        ],
        ourSRC: null,
        sendNewIconToBD: false,
        newIconID: 0,
        actionID: 0,
        ourIconID: 0,
        ourIconCoord: {x: 0, y: 0, degree: 0,},
        ourMouseCoord: {x: 0, y: 0,},
        // Perhaps collect all these into one object at a late time
        // p_id: props.location.state.p_id,
        projdata: [],
        mapblob: "",
      };
      this.selectIcon = this.addIconToList.bind(this)
  }

  sendOnly() {
    console.log("Send til Databasen");
  }

  sendDatabaseEvent() {
    // rettningen, xogykoordinat, tid, icon
    const data = new FormData();
    const coordinates = [this.state.ourIconCoord.x-25, this.state.ourIconCoord.y-25];
    data.append('direction', this.state.ourIconCoord.degree);
    data.append('center_coordinate', coordinates);
    data.append('created', new Date());
    data.append('f_id', this.state.ourIconID);
    // console.log(data);

    fetch('http://localhost:5000/addevent', {
    method: 'POST',
    body: data,
    }).then((response) => {
      // console.log(response);
    });
  }

  updateCoord(event) {
    this.setState({
      ourMouseCoord: {
        x: event.clientX,
        y: event.clientY,
      }
    });
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
    let list = document.getElementById('iconList');
    let li = document.createElement('li');

    // let ele = list.getElementsByTagName('li')
    // console.log(ele);

    let newSrc = e.target.src;
    this.setState({icons: [...this.state.icons, newSrc]}, function() {
    });
    // Onclick call changeIcon

    let newText = this.setInnerHTML(e.target.getAttribute('id'));
    li.setAttribute('id', newText);
    let alreadyExists = this.alreadyInList(newText, list)

    if (alreadyExists === false) {
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
    } else {
      alert('This icon already exists in the list!');
      this.closeIconSelect();
    }
  }

  alreadyInList(newText, list) {
    let ele = list.getElementsByTagName('li')
    // console.log(ele);
    for (let i = 0; i < ele.length; i ++) {
      console.log(ele[i])
      if (ele[i].getAttribute('id') === newText) {
        console.log("alEX")
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
    document.getElementById('iconContainer').appendChild(img);
    img.style.top =  (event.clientY)+'px';
    img.style.left = (event.clientX) +'px';
    var x = event.clientX;
    var y = event.clientY;
    this.setState({
      ourIconCoord: {
        x: x,
        y: y,
      }
    });
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

  hideIcon() {
    var icon = document.getElementById(this.state.ourIconID.toString())
    if (icon != null) {
      icon.style.display = 'none';
    }
    this.stopPointing()
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
      this.sendOnly();
      this.setState({sendNewIconToBD: false}, function() {});
    }
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
    this.setState({ addIcon: false});
  }
  
  componentDidMount() {
    fetch(`getprojectmapping?p_id=${this.state.p_id}`).then(res => res.json())
    .then(data => {
      this.setState({projdata: data});
    });
    fetch(`getmap?p_id=${this.state.p_id}`).then(res => res.blob())
      .then(images => {
        let image = URL.createObjectURL(images);
        this.setState({mapblob: image});
      });
  }

  render() {
    return (
      <div id='maincont'>
        <div className="sidebar">
          <div className={this.state.addIcon ? "visible" : "icons-invisible"}>
              <AllIcons selectIcon = {this.selectIcon} />
              <button id="exitIconSelect" onClick={() => this.closeIconSelect()}>Return</button>
            </div>
              <ul id="iconList">
                <li className="buttonLi" onClick={() => this.newIcon()}>Add Event</li>
                <li className="buttonLi" onClick={() => this.showAll()}>Show icons</li>
                <li className="buttonLi" onClick={() => this.hideAll()}>Hide icons</li>
              </ul>
        </div>
        
        <img alt="" onMouseMove={e => this.updateCoord(e)} 
            onClick={e => this.takeAction(e)} 
            className='map-image' 
            src={this.state.mapblob} />
          <div id="iconContainer" />

      </div>
    );
  }
} // <AllIcons closeIconSelect = {this.closeIconSelect} />

export default BehaviourMapping;

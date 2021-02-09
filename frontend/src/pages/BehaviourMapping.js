import React from 'react';
import AllIcons from '../components/AllIcons';
import './BehaviourMapping.css'

class BehaviourMapping extends React.Component {
  constructor() { //props
      super() //props


      this.state = {
        background: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
        icons: [
        ],
        ourSRC: null,
        newIconID: 0,
        actionID: 0,
        ourIconID: 0,
        ourIconCoord: {
          x: 0,
          y: 0,
          degree: 0,
        },
        ourMouseCoord: {
          x: 0,
          y: 0,
        },
        iconList_ID: 0,
      };
      this.background = {
          imageURL: '',
      };
      this.closeIconSelect = this.closeIconSelect.bind(this)
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
    this.setState({ addIcon: true })
  }

  closeIconSelect(e) {
    // lag et li object
    let list = document.getElementById('iconList');
    let li = document.createElement("li");
    console.log(e.target);
    let newSrc = e.target.src;
    this.setState({icons: [...this.state.icons, newSrc]}, function() {
    });
    // Onclick call changeIcon
    li.setAttribute('id', newSrc);
    li.innerHTML = li.getAttribute('id');
    // vi bytter og skjuler, og sikrer oss at knappene kan gjøre det
    li.addEventListener('click', () => {
      this.setState({ourSRC: li.getAttribute('id')});
      this.hideIcon()
    });
    this.setState({ourSRC: newSrc,}, function() {});
    this.hideIcon()

    list.appendChild(li);
    this.setState({
      imgIcon: li.getAttribute('id')
    });
    this.setState({ addIcon: false}); // rem iconlist
  }

  takeAction(event) {
    if (this.state.ourSRC != null) {
      if (this.state.actionID === 0) {
        this.placeIcon(event);
        this.setState({
          actionID: 1,
        });
      } else {
        this.pointIcon();
      }
    }
  }

  hideIcon() {
    var icon = document.getElementById(this.state.ourIconID.toString())

    if (icon != null) {
      icon.style.display = 'none';
    }
    this.setState({
      actionID: 0,
    });
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

  render() {
    return (
      <div id='maincont'>
          <div className="sidebar">
              <ul id="iconList">
                  <li onClick={() => this.newIcon()}>Add Event</li>
              </ul>
            </div>
         
            <img alt="" onMouseMove={e => this.updateCoord(e)} 
            onClick={e => this.takeAction(e)} 
            className='backgroundImage' 
            height="500px" 
            width="500px" 
            order="3"
            src={this.state.background} />
            <div id="iconContainer" />
        <button onClick={() => this.print()}>Show</button>
        <div id="iCont" className={this.state.addIcon ? "visible" : "icons-invisible"}
            ><AllIcons closeIconSelect = {e => this.closeIconSelect(e)} />
          </div>
      </div>
    );
  }
} // <AllIcons closeIconSelect = {this.closeIconSelect} />

export default BehaviourMapping;

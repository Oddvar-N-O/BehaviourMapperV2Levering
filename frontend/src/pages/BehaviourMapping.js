import React from 'react';
import AllIcons from '../components/AllIcons';
import './BehaviourMapping.css'

class BehaviourMapping extends React.Component {
  constructor() { //props
      super() //props

      this.state = {
        addIcon: false,
        imgIcon: 0,
        background: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
        icons: [
          'https://miro.medium.com/max/1200/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg',
          'https://i.redd.it/695k3qokjvt51.png',
          'https://i.ibb.co/z4VBh7G/download-10.jpg',
          'https://i.pinimg.com/originals/31/af/a5/31afa5e7acd31a8b8d0ea0afb64ff5b1.jpg'
        ],
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
        }
      };
      this.background = {
          imageURL: '',
      };
      this.closeIconSelect = this.closeIconSelect.bind(this)
  }

  closeIconSelect() {
    console.log('test')
    this.setState({ 
      addIcon: false 
    })
  }  

  // set state to change the uri
  sendDatabaseEvent() {
      // rettningen, xogykoordinat, tid, icon
      const data = new FormData();
      const coordinates = [this.state.ourIconCoord.x-25, this.state.ourIconCoord.y-25];
      data.append('direction', this.state.ourIconCoord.degree);
      data.append('center_coordinate', coordinates);
      data.append('created', new Date());

      console.log(data);

      fetch('http://localhost:5000/addevent', {
      method: 'POST',
      body: data,
      }).then((response) => {
        console.log(response);
      });
    }

  showMarker(event) {
    var mark = document.getElementById('icon');
    mark.style.top =  (event.clientY)+'px';
    mark.style.left = (event.clientX) +'px';
  }

  changeIcon(icNum) {
    // choose new icon
    this.setState({
      imgIcon: icNum
    });
    // hide old icon
    this.hideIcon();
    // send old icon to db
    this.sendDatabaseEvent()
  }

  

  hideIcon() {
    var icon = document.getElementById(this.state.ourIconID.toString())
    if (icon != null) {
      icon.style.display = 'none';
    }
    // this.state.actionID = 0;
    this.setState({
      actionID: 0,
    });
  }

  takeAction(event) {
    if (this.state.actionID === 0) {
      this.showIcon(event);
      // this.state.actionID = 1;
      this.setState({
        actionID: 1,
      });
    } else {
      this.pointIcon();
    }
  }

  pointIcon() {

    var degreerot = Math.atan2(
        this.state.ourMouseCoord.x - this.state.ourIconCoord.x,
        -(this.state.ourMouseCoord.y - this.state.ourIconCoord.y),
    ); // our target is the mouse substracted by iconlocation
    // the second param is the Y dir
    var degrees = degreerot*180/Math.PI;
    var round_degree = Math.round(degrees);
    var string_degree = 'rotate(' + round_degree.toString() +'deg)';
    // console.log("degROTATE: " + string_degree);
    // this.state.ourIconCoord.degree = string_degree;
    this.setState({
      ourIconCoord: {
        x: this.state.ourIconCoord.x,
        y: this.state.ourIconCoord.y,
        degree: string_degree
      }
    });
    
    console.log('degree: ' + string_degree);
    console.log('our degree: ' + this.state.ourIconCoord.degree);
    // point icon with css
    var img = document.getElementById(this.state.ourIconID.toString());
    img.style.transform = string_degree;

  }

  showIcon(event) {
    // make element invisible:
    var img = document.createElement('img');
    // set attributes
    img.src = this.state.icons[this.state.imgIcon];
    img.classList.add('icon');
    img.setAttribute('id', this.state.newIconID.toString());

    // this.state.ourIconID = this.state.newIconID;
    this.setState({
      ourIconID: this.state.newIconID
    });
    // console.log("OurICONID: " + this.state.ourIconID);
    this.setState({
      newIconID: this.state.newIconID + 1
    });
    // this.state.newIconID += 1;
    img.addEventListener('click', function() {
      console.log(img.getAttribute('id'));
    });
    document.getElementById('iconContainer').appendChild(img);
    
    // place icon on larger image
    // and set current icon coordinates
    img.style.top =  (event.clientY)+'px';
    img.style.left = (event.clientX) +'px';

    // find and save positon image was placed on
    var x = event.clientX; // - 200;
    var y = event.clientY;
    // console.log("Placement: Left? : " + x + " ; Top? : " + y + ".");
    
    this.setState({
      ourIconCoord: {
        x: x + 25,
        y: y + 25,
      }
    });
  }

  updateCoord(event) {
    this.setState({
      ourMouseCoord: {
        x: event.clientX,
        y: event.clientY,
      }
    });
      // console.log("Mouse: x : " + event.clientX + " ; y : " + event.clientY + ".");
  }

  print() {
    console.log('Print all');
    console.log('currID: ' + this.state.newIconID);
    var icon;
    for (var i=0; i<this.state.newIconID; i++) {
      console.log('id ' + i);
      icon = document.getElementById(i.toString());
      icon.style.display = 'block';
    }
  }

  render() {
    return (
      <div id='maincont'>
          <div className="sidebar">
          <div className={this.state.addIcon ? "visible" : "icons-invisible"}
           ><AllIcons closeIconSelect = {this.closeIconSelect} /></div>
            <ul id="iconList">
                <li onClick={() => this.setState({ addIcon: true })}>Add Event</li>
                <li onClick={() => this.changeIcon(0)}>babYod</li>
                <li onClick={() => this.changeIcon(1)}>lego Yoda</li>
                <li onClick={() => this.changeIcon(2)}>brick lego Yoda</li>
                <li onClick={() => this.changeIcon(3)}>yodThanos</li>
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
      </div>
    );
  }
}

export default BehaviourMapping;
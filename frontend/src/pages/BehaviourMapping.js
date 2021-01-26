import React from 'react';
// import Kart from '../components/Kart';
// import Sidebar from '../components/sidebar'
import './BehaviourMapping.css'

class BehaviourMapping extends React.Component {
  constructor() { //props
      super() //props

      this.state = {
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
        },
        ourMouseCoord: {
          x: 0,
          y: 0,
        }
      };
      this.background = {
          imageURL: '',
      };
  }

  showMarker(event) {
    var mark = document.getElementById('icon');
    mark.style.top =  (event.clientY)+'px';
    mark.style.left = (event.clientX) +'px';
  }

  // bruk disse 2 funksjonen for å legge til
  // items som props

  // her forandrer vi bildet
  changeIcon(icNum) {
    console.log("Test");
    console.log(icNum);
    this.setState({
      imgIcon: icNum
    });
    this.hideIcon();
  }

  hideIcon() {
    var icon = document.getElementById(this.state.ourIconID.toString())
    if (icon != null) {
      icon.style.display = 'none';
    }
    this.state.actionID = 0;
  }

  takeAction(event) {
    if (this.state.actionID === 0) {
      this.showIcon(event);
      this.state.actionID = 1;
    } else {
      this.pointIcon();
    }
  }

  /* I have already figured out that by drawing a line between Bob and
  the mouse and by finding the angle of this line, i can find out what
  the angle is, that Bob needs to face in order to 'point' towards the
  mouse. However I still don't know how to accomplish this task. */
  pointIcon() {

    var degreerot = Math.atan2(
        this.state.ourMouseCoord.x - this.state.ourIconCoord.x,
        -(this.state.ourMouseCoord.y - this.state.ourIconCoord.y),
    ); // our target is the mouse substracted by iconlocation
    // the second param is the Y dir
    var degrees = degreerot*180/Math.PI;
    var round_degree = Math.round(degrees);
    var string_degree = 'rotate(' + round_degree.toString() +'deg)';
    console.log("degROTATE: " + string_degree);

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

    this.state.ourIconID = this.state.newIconID;
    // console.log("OurICONID: " + this.state.ourIconID);

    this.state.newIconID += 1;
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
    
    this.state.ourIconCoord.x = x + 25;
    this.state.ourIconCoord.y = y + 25;

    // make rotate
  }

  updateCoord(event) {
      this.state.ourMouseCoord.x = event.clientX;
      this.state.ourMouseCoord.y = event.clientY;
      // console.log("Mouse: x : " + event.clientX + " ; y : " + event.clientY + ".");
  }

  // onmousemove skulle la bildene bli dratt av musen
  // trykk for å velge ikon
  // Trykk på bildet 1 for å plassere
  // trykk på bildet 2 for å plassere
  // trykk på icon 1 for å bli kvitt bildet

  showAll() {
    console.log('Print all');
  }

  render() {
    return (
      <div id='maincont'>
        <div id="testAppendTextIcon">
          <div className="sidebar">
            <ul id="iconList">
                <li onClick={() => this.changeIcon(0)}>babYod</li>
                <li onClick={() => this.changeIcon(1)}>lego Yoda</li>
                <li onClick={() => this.changeIcon(2)}>brick lego Yoda</li>
                <li onClick={() => this.changeIcon(3)}>yodThanos</li>
            </ul>
          </div>
        </div>
        <img alt="" onMouseMove={e => this.updateCoord(e)} onClick={e => this.takeAction(e)} id='backgroundImage' height="500px" width="500px" src={this.state.background} />
        <div id="iconContainer">
        </div>
        <button onClick={() => this.showAll()}>SHOW ALL</button>
      </div>
    );
  } //  onMouseMove={e => this.rotBigImg(e)}
} // <button>You are now: {this.state.actionText[this.state.actionID]}</button>
// <button onClick={() => this.insertIntoIcons("Yo")}>AppendIconToList</button>
  
export default BehaviourMapping;


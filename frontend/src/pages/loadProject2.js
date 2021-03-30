import React from 'react';
// import SidebarLP from '../components/sidebarLP';
import { Link } from 'react-router-dom';
import * as AiIcons from 'react-icons/ai';
import './loadProject2.css'


class loadProject2 extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            userID: 1,
            project_id: "",
            allProjects: "",
            currProject: "",
            index: 0,
            mapblob: "",
        }
    }

  componentDidMount() {
    fetch(`getproject?u_id=${this.state.userID}`)
    .then(res => res.json())
    .then(data => {
      this.setState({projdata: data});
    });
    this.makeList()
  }

  makeList() {
    
  }

  loadMap() {
    fetch(`getmap?p_id=${this.state.p_id}`).then(res => res.blob())
    .then(images => {
      let image = URL.createObjectURL(images);
      console.log('getmap: ' + image)
      this.setState({mapblob: image});
    });
  }

  loadEvents() {
    fetch(`getevents?p_id=${this.state.p_id}`)
    .then(res => res.json())
    .then(data => {
      // this.setState({formerEvents: data});
      setTimeout(() => this.loadFormerEvents(data), 500);
  });
  }

  getMap() {
    fetch(`getmap?p_id=${this.state.p_id}`).then(res => res.blob())
    .then(images => {
    let image = URL.createObjectURL(images);
      console.log('getmap: ' + image)
      this.setState({mapblob: image});
    });
  }

  loadFormerEvents(data) {
    console.log(data);
  }

  // <SidebarLP  getCurrProj={this.state.currProject} projects={allProjects} />

  render() {
      return (
          <div id="load-project">
            <div className="load-project-box">
            <Link to="/startpage" className="close-icon">
              <AiIcons.AiOutlineClose />
            </Link>
            </div>
            <img alt="" id='map' src={this.state.mapblob}/>
            <ul>
              <li className="buttonLi" onClick={() => this.newIcon()}>
                b1
              </li>
            </ul>
          </div>
      )
    }
}
// <SidebarLP  getCurrProj={getCurrProj} projects={allProjects} />

export default loadProject2;     
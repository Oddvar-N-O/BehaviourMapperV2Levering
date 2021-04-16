import React from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Zoom from 'ol/control/Zoom';
import { transform } from 'ol/proj'
import { Link } from 'react-router-dom';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import {transformExtent} from 'ol/proj';
import './ChooseImage.css'
import { Authenticated } from './auth/AuthContext'

class ChooseImage extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        projectName: props.location.state.projectName,
        description: props.location.state.description,
        p_id: "",
        u_id: window.sessionStorage.getItem('uID'),
      }
      this.map = new Map({
        target: null,
        layers: [new TileLayer({source: new OSM()})],
        view: new View({center: transform([5.733107, 58.969975],
          'EPSG:4326', 'EPSG:3857'), zoom: 12}),
        controls: [new Zoom()]
      });
      this.addProject = this.addProject.bind(this);
      this.redirectToMapping = this.redirectToMapping.bind(this);
  }

  addProject() {
    let centerCoordinates = this.map.getView().calculateExtent(this.map.getSize());
    centerCoordinates = transformExtent(centerCoordinates, 'EPSG:3857', 'EPSG:4326');
    let size = this.map.getSize();
    const data = new FormData();
    const zoom = this.map.getView().getZoom()
    data.append('name', this.state.projectName);
    data.append('description', this.state.description);
    data.append('startdate', new Date());
    data.append('originalsize', size);
    data.append('zoom', zoom);
    data.append('leftX', centerCoordinates[0]);
    data.append('lowerY', centerCoordinates[1]);
    data.append('rightX', centerCoordinates[2]);
    data.append('upperY', centerCoordinates[3]);
    data.append('u_id', this.state.u_id);
    fetch(window.backend_url + 'addproject', {
    method: 'POST',
    body: data,
    }).then((response) => {
        response.json().then((data) => {
            this.setState({p_id: data.p_id[0]});
        });
        this.exportImg()
    });
  }

  exportImg() {
    var mapCanvas = document.createElement('canvas');
    var size = this.map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    var mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(
      document.querySelectorAll('.ol-layer canvas'),
      function (canvas) {
        if (canvas.width > 0) {
          var opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          var transform = canvas.style.transform;
          var matrix = transform
            .match(/^matrix([^]*)$/)[1]
            .split(',')
            .map(Number);
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix,);
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    fetch(mapCanvas.toDataURL())
        .then(res => res.blob())
        .then(blob => {
          blob.lastModifiedDate = new Date();
          blob.name = this.state.projectName + ".png";
          var file = new File([blob], blob.name, 
            { lastModified: new Date().getTime(), type: blob.type })
          const data = new FormData();
          data.append('file', file);
          data.append('p_id', this.state.p_id);
          data.append('u_id', this.state.u_id);
          data.append('map', true);
          fetch(window.backend_url + 'upload', {
            method: 'POST',
            body: data,
          }).then(setTimeout(
            () => this.redirectToMapping(), 2000));
      }); 
  }

  redirectToMapping() {
    this.props.history.push({
      pathname: '/mapping',
      state: {
          p_id: this.state.p_id,
          imageUploaded: false,
      },
    });
  }
  
  componentDidMount() {
    this.map.setTarget("choose-image-map");
    this.map.on("moveend", () => {
      let center = this.map.getView().getCenter();
      let zoom = this.map.getView().getZoom();
      this.setState({ center, zoom });
    });
  }

  render() {
      return (
        <Authenticated>
          <div className="choose-image">
              <div className="choose-image-sidebar">
              <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: false,
                    projectName: this.state.projectName,
                    description: this.state.description,
                }
              }}>
                <BiIcons.BiArrowBack className="back-icon"/>
              </Link> 
              {/* <span className="back-icon-text"> go back </span> */}
              <div className="sidebar-text"> Projectname: <br/> {this.state.projectName}</div>
              <div className="sidebar-text">Zoom in to choose your location,
              then click "Use Map" to proceed</div>
              <button className="choose-image-button" onClick={this.addProject}>Use Map</button>
            </div>
              <Link to="/startpage" className="close-icon">
                  <AiIcons.AiOutlineClose />
              </Link>
              <div id="choose-image-map"/>
          </div>
        </Authenticated>
      )
  }
}


export default ChooseImage
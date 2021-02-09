import React from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Zoom from 'ol/control/Zoom';
import { transform } from 'ol/proj'
import { Link } from 'react-router-dom';
import * as AiIcons from 'react-icons/ai';
import './ChooseImage.css'

class ChooseImage extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        projectName: props.location.state.projectName,
        description: props.location.state.description,
        p_id: props.location.state.p_id,
      }
      this.map = new Map({
        target: null,
        layers: [new TileLayer({source: new OSM()})],
        view: new View({center: transform([5.733107, 58.969975], 'EPSG:4326', 'EPSG:3857'), zoom: 12}),
        controls: [new Zoom()]
      });
      this.exportImg = this.exportImg.bind(this);
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
          var file = new File([blob], blob.name, { lastModified: new Date().getTime(), type: blob.type })
          const data = new FormData();
          data.append('file', file);
          data.append('p_id', this.state.p_id)
          fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: data,
          })
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
        <div id="choose-image">
          <div className="choose-image-box">
            <h1>{this.state.projectName}</h1>
            <Link to="/startpage" className="close-icon">
                <AiIcons.AiOutlineClose />
            </Link>
            <div id="choose-image-map"/>
            <button className="choose-image-button" onClick={this.exportImg}>Choose image</button>
          </div>
        </div>
      )
  }
}


export default ChooseImage
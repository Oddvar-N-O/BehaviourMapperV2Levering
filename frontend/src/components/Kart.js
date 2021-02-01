import React from "react";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Zoom from 'ol/control/Zoom';

class Kart extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        name: this.props.name
      }
      
      this.map = new Map({
        target: null,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: [0, 0],
          zoom: 2
        }),
        controls: [
          new Zoom({
            zoomInClassName: "zin",
            zoomOutClassName: "zout",
          })
        ]
      });
    }

    componentDidMount() {
      this.map.setTarget("map");
  
      this.map.on("moveend", () => {
        let center = this.map.getView().getCenter();
        let zoom = this.map.getView().getZoom();
        this.setState({ center, zoom });
      });
    }

    exportImg(todb) {
      var map = this.map;
      map.once('rendercomplete', function () {
        var mapCanvas = document.createElement('canvas');
        var size = map.getSize();
        /* console.log("size x " + size[0])
        console.log("size y " + size[1])*/
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        var mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              // console.log("Width > 0");
              var opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
              var transform = canvas.style.transform;
              // Get the transform parameters from the style's transform matrix
              var matrix = transform
                .match(/^matrix([^]*)$/)[1]
                .split(',')
                .map(Number);
              // Apply the transform to the export map context
              // console.log("has transformed.");
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              );
              // console.log("Set MapContext");
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        if (navigator.msSaveBlob) {
          // console.log("SaveBlob");
          // link download attribuute does not work on MS browsers
          navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
        } else {
          var link;
          if (!todb) {
            link = document.getElementById('image-download');
            link.href = mapCanvas.toDataURL();
            link.click();
          } else {
            fetch(mapCanvas.toDataURL())
            .then(res => res.blob()) // Gets the response and returns it as a blob
            .then(blob => {
                    // Here's where you get access to the blob
                    // And you can use it for whatever you want
                    // Like calling ref().put(blob)
    
                    // Here, I use it to make an image appear on the page
                    // let objectURL = URL.createObjectURL(blob);
                    // This is the problem. objectURL does not work
              blob.lastModifiedDate = new Date();
              blob.name = "fileName";
                
              var file = new File([blob], "name.png", { lastModified: new Date().getTime(), type: blob.type })
              
              console.log(blob);
              console.log(file);
              const data = new FormData();

              data.append('file', file);
  
              fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: data,
              }).then((response) => {
                response.json().then((body) => {
                 console.log(response);
                });
              });    
          }); // fetch1

          }
        }
      });
      map.renderSync();
    }

  showname() {
    console.log(this.state.name);
  }
  
  render() {
    return (  
      <div>
        <div id="map" style={{ width: "610px", height: "410px" }}></div>
        <div id="myImg"></div>
        <button className="download" onClick={e => this.exportImg(false)}>Download Image</button>
        <button className="download" onClick={e => this.exportImg(true)}>Export to DB</button>
        <button className="download" onClick={() => this.showname()}>{this.state.name}</button>
        <a id="image-store" style={{display: 'none'}} href="www.google.com">HiddenText</a>
        <a id="image-download" style={{display: 'none'}} href="www.google.com" download>HiddenText</a>
      </div>
    );
  }
}

export default Kart;
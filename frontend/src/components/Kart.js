import React from "react";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Zoom from 'ol/control/Zoom';

class Kart extends React.Component {
    constructor(props) {
      super(props);

      this.map = new Map({
        target: null,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        // controls: defaultControls({attribution: false}).extend([attribution]),
        // controls : defaultControls({attribution: false}).extend([this.attribution]),
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

    /*checkSize() {
      var small = this.map.getSize()[0] < 600;
      attribution.setCollapsible(small);
      attribution.setCollapsed(small);
    }*/

    componentDidMount() {
      this.map.setTarget("map");
  
      // Listen to map changes
      this.map.on("moveend", () => {
        let center = this.map.getView().getCenter();
        let zoom = this.map.getView().getZoom();
        this.setState({ center, zoom });
      });
    }

    exportImg() {
      var map = this.map;
      map.once('rendercomplete', function () {
        var mapCanvas = document.createElement('canvas');
        var size = map.getSize();
        console.log("size x " + size[0])
        console.log("size y " + size[1])
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        var mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              console.log("Width > 0");
              var opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
              var transform = canvas.style.transform;
              // Get the transform parameters from the style's transform matrix
              var matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number);
              // Apply the transform to the export map context
              console.log("has transformed.");
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              );
              console.log("Set MapContext");
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        if (navigator.msSaveBlob) {
          console.log("SaveBlob");
          // link download attribuute does not work on MS browsers
          navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
        } else {
          var link = document.getElementById('image-download');
          link.href = mapCanvas.toDataURL();
          link.click();
        }
      });
      map.renderSync();
    }
  
  render() {
    return (
      <div>
        <div id="map" style={{ width: "610px", height: "410px" }}>
          <button onClick={e => this.exportImg()}>Choose Image</button>
        </div>
        <a id="image-download" download="map.png"></a>
      </div>
    );
  }
}
  
export default Kart;
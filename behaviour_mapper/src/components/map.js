import React, { Component } from 'react';
// import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

// type State = {
//   lat: number,
//   lng: number,
//   zoom: Number,
// }

class Map extends Component {
//   state = {
//     lat: 51,
//     lng: 0,
//     zoom: 13, 
//   }

  render() {
    // const position = [this.state.lat, this.state.lng];
    return (
      <div id="map">
        map
          {/* <Map center={position} zoom={this.state.zoom} scrollWheelZoom={false}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /> */}
          {/* <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker> */}
        {/* </Map> */}
      </div>
    );
  }
}  
export default Map;
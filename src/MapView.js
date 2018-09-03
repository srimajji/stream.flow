import React, { Component } from "react";
import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";

class MapView extends Component {
  render() {
    const { latitude, longitude } = this.props;
    const Map = ReactMapboxGl({
      accessToken:
        "pk.eyJ1Ijoic3JpbWFqamkiLCJhIjoiY2psbGxlNWFiMHlyZTNwcG5wZG01eDY3cSJ9.bF5BpOI9ng0e1qlOlc8Emg"
    });
    return (
      <Map
        style="mapbox://styles/mapbox/streets-v9"
        containerStyle={{
          height: "100vh",
          width: "100vw"
        }}
        zoom={[10]}
        center={[longitude, latitude]}
        onDragEnd={e => {
          console.log("New bound box cords", e.getBounds());
        }}
      >
        <Layer type="symbol" id="marker" layout={{ "icon-image": "marker-15" }}>
          <Feature coordinates={[longitude, latitude]} />
        </Layer>
      </Map>
    );
  }
}

export default MapView;

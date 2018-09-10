import React, { Component } from "react";
import ReactMapboxGl, { Layer, Feature, GeoJSONLayer } from "react-mapbox-gl";
import axios from "axios";
import toGeoJSON from "togeojson";
import * as MapboxGL from "mapbox-gl";
import { get } from "lodash";

const Map = ReactMapboxGl({
    accessToken:
        process.env.REACT_APP_MAPBOX_TOKEN
});

const mapStyle = {
    flex: 1
};

const symbolLayout: MapboxGL.SymbolLayout = {
    'text-field': '{place}',
    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    'text-offset': [0, 0.6],
    'text-anchor': 'top'
};
const symbolPaint: MapboxGL.SymbolPaint = {
    'text-color': 'red'
};

const circleLayout: MapboxGL.CircleLayout = { visibility: 'visible' };
const circlePaint: MapboxGL.CirclePaint = {
    'circle-color': 'red'
};

const layerPaint = {
    // make circles larger as the user zooms from z12 to z22
    'circle-radius': {
        'base': 3,
        'stops': [[12, 2], [22, 180]]
    },
    // color circles by ethnicity, using a match expression
    // https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
    'circle-color': "#223b53"
};

class MapView extends Component {
    constructor() {
        super();
        this.state = {
            upperLat: null,
            upperLng: null,
            lowerLat: null,
            lowerLng: null,
            geoJSON: null,
            center: null,
        }
    }

    getBoundBox(upperBound, lowerBound, center) {
        const upperLat = upperBound.lat.toPrecision(3);
        const upperLng = upperBound.lng.toPrecision(3);
        const lowerLat = lowerBound.lat.toPrecision(3);
        const lowerLng = lowerBound.lng.toPrecision(3);
        axios.get(`http://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${lowerLng},${lowerLat},${upperLng},${upperLat}&format=ge&siteType=ST,LK,ES&hasDataTypeCd=dv`)
            .then(response => {
                const xmlData = new DOMParser().parseFromString(response.data, "application/xml");
                const kml = toGeoJSON.kml(xmlData);
                this.setState({ geoJSON: kml, center: center });
            })
            .catch(error => console.error(error));

    }

    onClickPoint(e) {
        console.log("site id: ", get(e.features.pop(), "id"));
        console.log(e);
    }

    render() {
        const { latitude, longitude } = this.props;
        this.state.geoJSON ? console.log(this.state.geoJSON) : null;
        const center = this.state.center ? [this.state.center.lng, this.state.center.lat] : [longitude, latitude];

        return (
            <Map
                style="mapbox://styles/mapbox/streets-v9"
                containerStyle={{
                    height: "100vh",
                    width: "100vw"
                }}
                // zoom={[10]}
                center={center}
                onDragEnd={e => {
                    const boundBox = e.getBounds();
                    this.getBoundBox(boundBox.getNorthEast(), boundBox.getSouthWest(), e.getCenter());
                }}
                onStyleLoad={e => {
                    const boundBox = e.getBounds();
                    this.getBoundBox(boundBox.getNorthEast(), boundBox.getSouthWest(), e.getCenter());
                }}
            >
                {
                    // this.state.geoJSON ?
                    // <GeoJSONLayer
                    //   data={this.state.geoJSON}
                    //   circleLayout={circleLayout}
                    //   circlePaint={circlePaint}
                    //   circleOnClick={this.onClickCircle}
                    //   symbolLayout={symbolLayout}
                    //   symbolPaint={symbolPaint}
                    //   circleOnMouseEnter={this.onClickPoint}
                    // /> : null
                }

                <Layer
                    type="circle"
                    paint={layerPaint}
                >
                    <Feature coordinates={center} />
                </Layer>

            </Map>
        );
    }
}

export default MapView;

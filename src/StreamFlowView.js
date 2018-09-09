import React, { Component } from "react";
import ReactMapboxGl, { Layer, Feature, GeoJSONLayer, Popup } from "react-mapbox-gl";
import axios from "axios";
import toGeoJSON from "togeojson";
import * as MapboxGL from "mapbox-gl";
import { get } from "lodash";

const Map = ReactMapboxGl({
    accessToken:
        process.env.ACCESS_TOKEN
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
        'base': 60,
        'stops': [[12, 2], [22, 180]]
    },
    // color circles by ethnicity, using a match expression
    // https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
    'circle-color': "#223b53"
};

class StreamFlowView extends Component {
    constructor() {
        super();
        this.state = {
            timeseries: [],
            center: null,
            active: null,
        }
    }

    getBoundBox(upperBound, lowerBound, center) {
        const upperLat = upperBound.lat.toPrecision(3);
        const upperLng = upperBound.lng.toPrecision(3);
        const lowerLat = lowerBound.lat.toPrecision(3);
        const lowerLng = lowerBound.lng.toPrecision(3);
        axios.get(`http://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${lowerLng},${lowerLat},${upperLng},${upperLat}`)
            .then(response => {
                const dataSet = get(response.data.value, "timeSeries");
                console.log("time series data", dataSet);
                if (dataSet) {
                    this.setState({ timeseries: dataSet, center: center });
                }
            })
            .catch(error => console.error(error));

    }

    onClickPoint(dataPoint) {
        console.log(dataPoint);
        this.setState({ active: dataPoint });
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

                <Layer
                    type="symbol"
                    id="marker"
                    layout={{ "icon-image": "aquarium-11", "icon-size": 2 }}

                >
                    {
                        this.state.timeseries.map((dataPoint, key) => (
                            <Feature key={key} timeseries={dataPoint} onClick={(e) => this.onClickPoint(dataPoint)} coordinates={[dataPoint.sourceInfo.geoLocation.geogLocation.longitude, dataPoint.sourceInfo.geoLocation.geogLocation.latitude]} />
                        ))
                    }
                </Layer>
                {this.state.active ?
                    <Popup coordinates={[this.state.active.sourceInfo.geoLocation.geogLocation.longitude, this.state.active.sourceInfo.geoLocation.geogLocation.latitude]}
                        anchor={'bottom-left'}
                        offset={[0, -86]}
                        onClick={() => {
                            this.setState({ active: null });
                        }}>
                        <pre>stream: {this.state.active.values[0].value[0].value}</pre>
                    </Popup> : null
                }
            </Map>
        );
    }
}

export default StreamFlowView;

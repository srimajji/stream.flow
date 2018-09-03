import React, { Component } from "react";
import logo from "./logo.svg";
import { Grid, Header, Message, Segment } from "semantic-ui-react";
import "./App.css";
import MapView from "./MapView";

class App extends Component {
  constructor() {
    super();
    this.state = {
      location: null
    };
  }
  componentDidMount() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(location => {
        this.setState({ location: location });
      });
    }
  }
  render() {
    const { location } = this.state;
    location && location.coords ? console.log(location.coords) : null;
    return (
      <div className="App">
        <Segment inverted circular={false} className="App-header">
          <Header textAlign="center">
            <Header.Content as="h2">Fish.ng</Header.Content>
          </Header>
        </Segment>
        <Grid padded>
          <Grid.Row>
            {location && (
              <div>
                <Grid.Column>
                  <Message>
                    <p>Latitude: {location.coords.latitude}</p>
                    <p>Longitude: {location.coords.longitude}</p>
                    <p>Accuracy: {location.coords.accuracy}</p>
                  </Message>
                </Grid.Column>
                <Grid.Column>
                  <MapView
                    latitude={location.coords.latitude}
                    longitude={location.coords.longitude}
                  />
                </Grid.Column>
              </div>
            )}
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;

var React = require('react');
var $ = require('jquery');
var Promise = require('es6-promise').Promise;

var BusStations = require('./BusStations');
var LoadingIndicator = require('./LoadingIndicator');

var BusPage = React.createClass({

  getInitialState: function() {
    return {
      location: undefined,
      stops: [],
    };
  },

  componentWillMount: function() {
    this.getLocation().then(this.getStops);
  },

  getLocation: function() {

    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(location => {
          console.log(location);
          this.setState({ location: location.coords });
          resolve();
        });
      }
      else reject(Error());
    });
  },

  getStops: function() {
    if (this.state.location) {
      $.ajax({
        type: 'GET',
        url: 'http://api.strae.to/',
        data: {
          latitude: this.state.location.latitude,
          longitude: this.state.location.longitude,
          range: this.state.location.accuracy + 500,
        },
        dataType: 'json',
      })
        .done(data => {
          console.log('Got stations', data);
          this.setState({ stops: data });
        })
        .fail(xhr => {
          console.log('Failed to gather data from api.strae.to');
        });
    }
    else {
      console.log('Could not gather stations because no location is available');
    }
  },

  render: function() {

    if (!this.state.location) return <LoadingIndicator text="Finn staðsetninguna þína" />;
    if (!this.state.stops.length) return <LoadingIndicator text="Finn næstu stöðvarnar" />;

    return (
      <span>
        <BusStations stops={this.state.stops} />
        <footer className="page-footer">Stræ.to er ótengt Strætó BS</footer>
      </span>
    );
  }

});

module.exports = BusPage;

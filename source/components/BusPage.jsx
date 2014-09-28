var React = require('react');
var Promise = require('es6-promise').Promise;
var request = require('superagent');

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
    this.getLocation().then(this.getStops).catch(this.handleNoLocation);
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
      request.get('http://api.strae.to/').query({
        latitude: this.state.location.latitude,
        longitude: this.state.location.longitude,
        range: this.state.location.accuracy + 500,
      }).on('error', this.handleDataError).end(res => {
        if (!res.ok) {
          console.log('Failed to gather data from api.strae.to');
          this.handleDataError();
          return;
        }
        console.log('Got stations', res.body);
        this.setState({ stops: res.body });
      });
    }
  },

  handleNoLocation: function() {
    this.setState({ locationError: true });
  },

  handleDataError: function() {
    this.setState({ dataError: true });
  },

  render: function() {

    if (this.state.dataError) return <span className="message">Ekki tókst að sækja upplýsingar um strætóa. Prófaðu aftur seinna.</span>;
    if (this.state.locationError) return <span className="message">Ekki tókst að sækja staðsetningu. Getur verið að þú hafir ekki leyft það?</span>;
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

var React = require('react');
var Promise = require('es6-promise').Promise;
var request = require('superagent');

var BusStations = require('./BusStations');
var LoadingIndicator = require('./LoadingIndicator');

var BusPage = React.createClass({

  getInitialState: function() {
    return {
      location: undefined,
      stops: undefined,
    };
  },

  componentWillMount: function() {
    
    // Safari needs to get his/hers shit together before asking for geolocation permission
    // http://stackoverflow.com/questions/27150465/geolocation-api-in-safari-8-and-7-1-keeps-asking-permission
    var that = this;
    setTimeout(function() {
      that.getLocation().then(that.getStops).catch(that.handleNoLocation);
    }, 10);
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
    if (this.state.locationError) return <span className="message">Ekki tókst að sækja staðsetninguna þína. Getur verið að þú hafir ekki leyft það?</span>;
    if (!this.state.location) return <LoadingIndicator text="Finn staðsetninguna þína" />;
    if (!this.state.stops) return <LoadingIndicator text="Finn næstu stöðvarnar" />;
    if (!this.state.stops.length) return <span className="message">Engar stöðvar fundust í nágreninu sem eru með ferð á næstunni.</span>;

    return (
      <span>
        <BusStations stops={this.state.stops} />
        <footer className="page-footer">Stræ.to er ótengt Strætó BS</footer>
      </span>
    );
  }

});

module.exports = BusPage;

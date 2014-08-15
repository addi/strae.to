var React = require('react');
var $ = require('jquery');
// var Promise = require('es6-promise');

var BusStations = React.createClass({

  propTypes: {
    stops: React.PropTypes.array,
  },

  render: function() {

    var stations = this.props.stops.map(stop => {

      var routes = stop.routes.map(route => {
        var times = route.current_times.map(time => {
          return <li className="busstop-route-time">{time}</li>
        });

        return (
          <li className="busstop-route">
            <h2 className="busstop-route-name"><span className="busstop-route-nr">{route.route}</span> {route.last_stop_name}</h2>
            <ul className="busstop-route-times">{times}</ul>
          </li>
        );
      });

      var distance = (stop.distance + '').split('.')[0] + 'm';

      return (
        <section className="busstop">
          <header className="busstop-header">
            <h1 className="busstop-name">{stop.long_name}</h1>
            <span className="busstop-distance">{distance}</span>
          </header>
          <ul className="busstop-routes">
            {routes}
          </ul>
        </section>
      )
    });

    return (
      <span>{stations}</span>
    );
  }

});

module.exports = BusStations;

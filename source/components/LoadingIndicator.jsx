var React = require('react');

var BusStations = React.createClass({

  propTypes: {
    text: React.PropTypes.string,
  },

  render: function() {

    return (
      <span className="message loadingIndicator">{this.props.text}</span>
    );
  }

});

module.exports = BusStations;

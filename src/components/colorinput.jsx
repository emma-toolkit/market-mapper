import React from 'react'
import config from '../config.json'
const createClass = React.createClass;
const colors = config.colors;

export default createClass({
  render() {
    return (
      <div>
        {colors.map(color =>
          <div
            className="swatch"
            key={color}
            style={{backgroundColor: color}}
          />
        )}
      </div>
    );
  }
});

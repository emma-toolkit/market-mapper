import React from 'react'
import config from '../config.json'
const createClass = React.createClass;
const colors = config.colors;

export default createClass({
  getClass(color) {
    return this.props.value === color ? 'selected' : '';
  },
  setColor(color) {
    this.props.setAttribute('color', color);
  },
  render() {
    return (
      <div>
        {colors.map(color =>
          <a
            className={'swatch ' + this.getClass(color)}
            key={color}
            style={{backgroundColor: color}}
            onClick={() => this.setColor(color)}
          />
        )}
      </div>
    );
  }
});

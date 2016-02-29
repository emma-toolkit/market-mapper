import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleChange(e) {
    this.props.setAttribute(this.props.attribute, e.target.value);
  },
  handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  },
  render() {
    return (
      <input
        type='number'
        min={this.props.min}
        max={this.props.max}
        value={this.props.value}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
      />
    );
  }
});

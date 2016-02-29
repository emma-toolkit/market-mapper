import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleChange(e) {
    this.props.setAttribute(this.props.attribute, e.target.checked);
  },
  render() {
    return (
      <input
        type='checkbox'
        checked={this.props.value}
        onChange={this.handleChange}
      />
    );
  }
});

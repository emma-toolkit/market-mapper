import React from 'react'
const createClass = React.createClass

export default createClass({
  getHandle() {
    if (!this.props.handle) return null;
    return (
      <div
        id='handle'
        style={{
          top: this.props.handle.y,
          left: this.props.handle.x
        }}
      />
    );
  },
  render() {
    return <div id='edges'>{this.getHandle()}</div>;
  }
});

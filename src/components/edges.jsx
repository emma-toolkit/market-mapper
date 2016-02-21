import React from 'react'
const createClass = React.createClass

export default createClass({
  getHandle() {
    return !this.props.handle ? null : (
      <div
        id='handle'
        onMouseDown={this.props.startConnecting}
        onMouseUp={this.props.endConnecting}
        style={{
          top: this.props.handle.y,
          left: this.props.handle.x
        }}
      />
    );
  },
  getLine() {
    // console.log(this.props.connecting);
    return !this.props.connecting ? null : (
      <svg id='edge-line'>
        <line
          x1={this.props.handle.x}
          y1={this.props.handle.y}
          x2='0'
          y2='0'
        />
      </svg>
    );
  },
  render() {
    return (
      <div id='edges'>
        {this.getHandle()}
        {this.getLine()}
      </div>
    );
  }
});

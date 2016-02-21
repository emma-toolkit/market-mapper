import React from 'react'
import throttle from 'lodash.throttle'
const createClass = React.createClass

export default createClass({
  getInitialState() {
    return {x: 0, y: 0};
  },
  componentDidUpdate() {
    const onMouseMove = this.props.connecting ?
      throttle(e => this.setState({x: e.clientX, y: e.clientY})) :
      null;
    window.onmousemove = onMouseMove;
  },
  handleMouseDown() {
    this.setState({x: this.props.handle.x, y: this.props.handle.y});
    this.props.startConnecting();
  },
  getHandle() {
    return !this.props.handle ? null : (
      <div
        id='handle'
        onMouseDown={this.handleMouseDown}
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
          x2={this.state.x}
          y2={this.state.y}
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

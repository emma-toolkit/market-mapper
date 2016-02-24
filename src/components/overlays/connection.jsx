import React from 'react'
import throttle from 'lodash.throttle'
import config from '../../config.json'
const createClass = React.createClass

export default createClass({
  getInitialState() {
    return {x: 0, y: 0};
  },
  componentDidUpdate() {
    const onMouseMove = this.props.connecting && !this.props.in_handle ?
      throttle(e => this.setState({x: e.clientX, y: e.clientY})) :
      null;
    window.onmousemove = onMouseMove;

      // [...document.getElementsByClassName('disruption')]
      //   .forEach(old => old.remove());

      // this.props.state.get('nodes').forEach(nodetype => {
      //   nodetype.forEach(node => {
      //     const disruption = node.get('disruption');
      //     if (disruption) {
      //       let char;
      //       switch (disruption) {
      //         case 'partial':
      //           char = '/';
      //           break;
      //         case 'major':
      //           char = 'X';
      //           break;
      //         case 'critical':
      //           char = '!';
      //           break;
      //       }
      //       console.log(this.refs.div.offsetWidth, this.refs.div.offsetHeight);
      //       const element = document.createElement('DIV');
      //       element.className = 'disruption';
      //       element.style.bottom = `${node.get('y') *
      //         this.refs.div.offsetHeight / config.layout.h}px`;
      //       element.style.right = `${node.get('x') *
      //         this.refs.div.offsetWidth / config.layout.w}px`;
      //       element.textContent = char;
      //       this.refs.div.appendChild(element);
      //     }
      //   });
      // });
  },
  handleMouseDown() {
    this.setState({
      x: this.props.out_handle.x,
      y: this.props.out_handle.y
    });
    this.props.startConnecting();
  },
  getEndPos() {
    return this.props.in_handle || this.state;
  },
  getOutHandle() {
    return !this.props.out_handle ? null : (
      <div
        className='handle'
        onMouseDown={this.handleMouseDown}
        style={{
          top: this.props.out_handle.y,
          left: this.props.out_handle.x
        }}
      />
    );
  },
  getInHandle() {
    return !this.props.in_handle ? null : (
      <div
        className='handle'
        style={{
          top: this.props.in_handle.y,
          left: this.props.in_handle.x
        }}
      />
    );
  },
  getLine() {
    const end_pos = this.getEndPos();
    return !this.props.connecting ? null : (
      <svg id='edge-line'>
        <line
          x1={this.props.out_handle.x}
          y1={this.props.out_handle.y}
          x2={end_pos.x}
          y2={end_pos.y}
        />
      </svg>
    );
  },
  render() {
    return (
      <div id='overlay' ref='div'>
        {this.getOutHandle()}
        {this.getInHandle()}
        {this.getLine()}
      </div>
    );
  }
});

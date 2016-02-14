import React from 'react'
const createClass = React.createClass

export default createClass({
  addNode() {this.props.addNode(this.props.nodetype)},
  render() {
    return (
      <div id={this.props.nodetype} className='nodetype'>
        <a className='add' href='#' onClick={this.addNode}>+</a>
      </div>
    );
  }
});

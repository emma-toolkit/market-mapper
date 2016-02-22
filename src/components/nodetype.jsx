import React from 'react'
import config from '../config.json'
const createClass = React.createClass;
const nodetypes = config.nodetypes;

export default createClass({
  addNode() {this.props.addNode(this.props.nodetype)},
  render() {
    return (
      <div id={this.props.nodetype} className='nodetype'>
        <h2 className='nodetype-title'>
          {nodetypes[this.props.nodetype]}
        </h2>
        <a className='add' href='#' onClick={this.addNode}>+</a>
      </div>
    );
  }
});

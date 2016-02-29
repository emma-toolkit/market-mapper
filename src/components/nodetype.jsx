import React from 'react'
import config from '../config.json'
const createClass = React.createClass;
const nodetypes = config.nodetypes;

export default createClass({
  render() {
    return (
      <div id={this.props.nodetype} className='nodetype'>
        <h2 className='section-title'>
          {nodetypes[this.props.nodetype]}
        </h2>
      </div>
    );
  }
});

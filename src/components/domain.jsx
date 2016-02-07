import React from 'react'
const createClass = React.createClass

export default createClass({
  addNode() {this.props.addNode(this.props.domain)},
  render() {
    return (
      <div id={this.props.domain} className='domain'>
        <a className='add' href='#' onClick={this.addNode}>+</a>
      </div>
    );
  }
});

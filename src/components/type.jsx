import React from 'react'
const createClass = React.createClass

export default createClass({
  render() {
    return (
      <div id={this.props.type}>
        <a className='add' href='#'>+</a>
      </div>
    );
  }
});

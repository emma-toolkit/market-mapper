import React from 'react'
const createClass = React.createClass

export default createClass({
  render() {
    const toggle_icon = this.props.show_controls ? '\u00bb' : '\u00ab'; 
    return (
      <div id='controls'>
        <a
          id='toggle-controls'
          href='#'
          onClick={this.props.toggleControls}
        >
          {toggle_icon}
        </a>
        <input type='file' name='csv' onChange={this.props.loadCSV} />
        <button onClick={this.props.doLayout}>Auto Layout</button>
        <button onClick={this.props.clear}>Clear</button>
        <button onClick={this.props.exportCSV}>Export</button>
      </div>
    );
  }
});

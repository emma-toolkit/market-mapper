import React from 'react'
import TextInput from './textinput.jsx'
const createClass = React.createClass

export default createClass({
  shouldComponentUpdate(next_props) {
    return next_props.show_controls !== this.props.show_controls ||
      next_props.selected !== this.props.selected;
  },
  selectedLabel() {
    return this.props.selected === null ? '' : this.props.selected.record.label;
  },
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
        <div id='controls-form'>
          <div id="node-controls">
            <label>Label:
              <TextInput selected={this.selectedLabel()} />
            </label>
            <button onClick={this.props.removeNode}>Remove Node</button>
          </div>
          <input type='file' name='csv' onChange={this.props.loadCSV} />
          <button onClick={this.props.doLayout}>Auto Layout</button>
          <button onClick={this.props.clear}>Clear</button>
          <button onClick={this.props.exportCSV}>Export</button>
        </div>
      </div>
    );
  }
});

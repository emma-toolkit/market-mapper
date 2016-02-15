import React from 'react'
import TextInput from './textinput.jsx'
import ColorInput from './colorinput.jsx'
const createClass = React.createClass;

export default createClass({
  shouldComponentUpdate(next_props) {
    return next_props.show_controls !== this.props.show_controls ||
      next_props.selected !== this.props.selected;
  },
  getAttribute(att) {
    const selected = this.props.selected;
    return selected !== null ? selected[att] : '';
  },
  setAttribute(att, value) {
    this.props.setNodeAttribute(att, value);
  },
  renderNodeControls() {
    return (
      <div className='controls-panel'>
        <label>Name:
          <TextInput
            attribute='name'
            value={this.getAttribute('name')}
            setAttribute={this.setAttribute}
          />
        </label>
        <label>Color:
          <ColorInput
            value={this.getAttribute('color')}
            setAttribute={this.setAttribute}
          />
        </label>
        <button onClick={this.props.removeNode}>Remove Node</button>
      </div>
    );
  },
  renderEdgeControls() {
    return (
      <div className='controls-panel'>
      </div>
    );
  },
  renderGraphControls() {
    return (
      <div className='controls-panel'>
        <input type='file' name='csv' onChange={this.props.loadCSV} />
        <button onClick={this.props.doLayout}>Auto Layout</button>
        <button onClick={this.props.clear}>Clear</button>
        <button onClick={this.props.exportCSV}>Export</button>
      </div>
    );
  },
  renderControls() {
    if (!this.props.show_controls) return null;
    return (
      <div>
        {this.props.selected !== null && this.renderNodeControls()}
        {this.renderGraphControls()}
      </div>
    );
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
        {this.renderControls()}
      </div>
    );
  }
});

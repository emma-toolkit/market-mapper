import React from 'react'
import TextInput from './textinput.jsx'
import ColorInput from './colorinput.jsx'
const createClass = React.createClass;

export default createClass({
  shouldComponentUpdate(next_props) {
    return next_props.show_controls !== this.props.show_controls ||
      next_props.selected !== this.props.selected ||
      next_props.graph !== this.props.graph;
  },
  getAttribute(att) {
    const selected = this.props.selected;
    return selected !== null ? selected[att] : '';
  },
  setAttribute(att, value) {
    this.props.setNodeAttribute(att, value);
  },
  nodeControls() {
    return (
      <div className='controls-section'>
        <h2 className='controls-heading'>Node</h2>
        <label className='controls-label'>Name</label>
        <TextInput
          attribute='name'
          value={this.getAttribute('name')}
          setAttribute={this.setAttribute}
        />
        <label className='controls-label'>Color</label>
        <ColorInput
          value={this.getAttribute('color')}
          setAttribute={this.setAttribute}
        />
        <label className='controls-label'>
          Examples
          <span className='label-tip'>shift+enter to submit</span>
        </label>
        <TextInput
          is_textarea={true}
          attribute='examples'
          value={this.getAttribute('examples')}
          setAttribute={this.setAttribute}
        />
        <div className='controls-buttons'>
          <button onClick={this.props.removeElement}>Remove Node</button>
        </div>
      </div>
    );
  },
  edgeControls() {
    return (
      <div className='controls-section'>
        <h2 className='controls-heading'>Edge</h2>
        <div className='controls-buttons'>
          <button onClick={this.props.removeElement}>Remove Edge</button>
        </div>
      </div>
    );
  },
  graphControls() {
    return (
      <div id="graph-controls" className='controls-section'>
        <h2 className='controls-heading'>Graph</h2>
        <label className='controls-label'>Graph Title</label>
        <TextInput
          attribute='title'
          value={this.props.graph.get('title')}
          setAttribute={this.props.setGraphAttribute}
        />
        <div className='controls-buttons'>
          <button onClick={this.props.doLayout}>Auto Layout Graph</button>
          <button onClick={this.props.clear}>Clear Graph</button>
        </div>
        <div className='controls-buttons'>
          <button onClick={this.props.exportCSV}>Export</button>
          <input type='file' name='csv' onChange={this.props.loadCSV} />
        </div>
      </div>
    );
  },
  renderControls() {
    if (!this.props.show_controls) return null;
    const selected = this.props.selected;
    return (
      <div>
        {selected !== null && selected.type === 'nodes' && this.nodeControls()}
        {selected !== null && selected.type === 'edges' && this.edgeControls()}
        {this.graphControls()}
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

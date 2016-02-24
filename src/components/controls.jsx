import React from 'react'
import TextInput from './textinput.jsx'
import ColorInput from './colorinput.jsx'
import SelectInput from './selectinput.jsx'
import RadioInput from './radioinput.jsx'
import NumberInput from './numberinput.jsx'
import CheckBoxInput from './checkboxinput.jsx'
import config from '../config.json'
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
    this.props.setElementAttribute(att, value);
    if (att === 'type') {
      const subtype = this.getAttribute('subtype');
      if (subtype) {
        if (!value) {
          this.setAttribute('subtype', '');
        } else {
          const nodetype = this.getAttribute('nodetype');
          const type_children = config.types[nodetype][value];
          if (type_children.indexOf(subtype) === -1) {
            this.setAttribute('subtype', '');
          }
        }
      }
    }
  },
  nodeControls() {
    return (
      <div className='controls-section'>
        <h2 className='controls-heading'>Node</h2>
        <label className='controls-label'>Type</label>
        <SelectInput
          attribute='type'
          value={this.getAttribute('type')}
          setAttribute={this.setAttribute}
          options={
            [''].concat(
              Object.keys(config.types[this.getAttribute('nodetype')])
            )
          }
        />
        <label className='controls-label'>Subtype</label>
        <SelectInput
          attribute='subtype'
          value={this.getAttribute('subtype')}
          setAttribute={this.setAttribute}
          options={
            [''].concat(
              config.types[this.getAttribute('nodetype')][this.getAttribute('type')]
            )
          }
        />
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
          Quantities
          <span className='label-tip'>shift+enter to submit</span>
        </label>
        <TextInput
          is_textarea={true}
          attribute='quantities'
          value={this.getAttribute('quantities')}
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
        <label className='controls-label'>Disruption</label>
        <RadioInput
          attribute='disruption'
          value={this.getAttribute('disruption')}
          setAttribute={this.setAttribute}
          options={config.disruptions}
        />
        <label className='controls-label'>Active</label>
        <CheckBoxInput
          attribute='active'
          value={this.getAttribute('active')}
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
        <label className='controls-label'>Width</label>
        <NumberInput
          attribute='width'
          value={this.getAttribute('width')}
          setAttribute={this.setAttribute}
        />
        <label className='controls-label'>
          Quantities
          <span className='label-tip'>shift+enter to submit</span>
        </label>
        <TextInput
          is_textarea={true}
          attribute='quantities'
          value={this.getAttribute('quantities')}
          setAttribute={this.setAttribute}
        />
        <label className='controls-label'>Active</label>
        <CheckBoxInput
          attribute='active'
          value={this.getAttribute('active')}
          setAttribute={this.setAttribute}
        />
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
          <button onClick={this.props.exportJSON}>Export</button>
          <input type='file' name='csv' onChange={this.props.loadJSON} />
        </div>
      </div>
    );
  },
  renderControls() {
    if (!this.props.show_controls) return null;
    const selected = this.props.selected;
    return (
      <div>
        {selected !== null && selected.element === 'nodes' && this.nodeControls()}
        {selected !== null && selected.element === 'edges' && this.edgeControls()}
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

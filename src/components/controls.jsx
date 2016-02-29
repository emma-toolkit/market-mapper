import React from 'react'
import TextInput from './inputs/text.jsx'
import ColorInput from './inputs/color.jsx'
import SelectInput from './inputs/select.jsx'
import RadioInput from './inputs/radio.jsx'
import StateRadioInput from './inputs/stateradio.jsx'
import NumberInput from './inputs/number.jsx'
import CheckBoxInput from './inputs/checkbox.jsx'
import config from '../config.json'
const createClass = React.createClass;

export default createClass({
  shouldComponentUpdate(next_props) {
    return next_props.show_controls !== this.props.show_controls ||
      next_props.selected !== this.props.selected ||
      next_props.graph !== this.props.graph ||
      next_props.state !== this.props.state;
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
        <div className='controls-label'>Type</div>
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
        <div className='controls-label'>Subtype</div>
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
        <div className='controls-label'>Name</div>
        <TextInput
          attribute='name'
          value={this.getAttribute('name')}
          setAttribute={this.setAttribute}
        />
        <div className='controls-label'>Color</div>
        <ColorInput
          value={this.getAttribute('color')}
          setAttribute={this.setAttribute}
        />
        <div className='controls-label'>
          Quantities
          <span className='label-tip'>shift+enter to submit</span>
        </div>
        <TextInput
          is_textarea={true}
          attribute='quantities'
          value={this.getAttribute('quantities')}
          setAttribute={this.setAttribute}
        />
        <div className='controls-label'>
          Examples
          <span className='label-tip'>shift+enter to submit</span>
        </div>
        <TextInput
          is_textarea={true}
          attribute='examples'
          value={this.getAttribute('examples')}
          setAttribute={this.setAttribute}
        />
        <div className='controls-label'>Disruption</div>
        <RadioInput
          attribute='disruption'
          value={this.getAttribute('disruption')}
          setAttribute={this.setAttribute}
          options={config.disruptions}
        />
        <div className='controls-label'>Active</div>
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
        <div className='controls-label'>Width</div>
        <NumberInput
          attribute='width'
          value={this.getAttribute('width')}
          setAttribute={this.setAttribute}
        />
        <div className='controls-label'>
          Quantities
          <span className='label-tip'>shift+enter to submit</span>
        </div>
        <TextInput
          is_textarea={true}
          attribute='quantities'
          value={this.getAttribute('quantities')}
          setAttribute={this.setAttribute}
        />
        <div className='controls-label'>Disruption</div>
        <RadioInput
          attribute='disruption'
          value={this.getAttribute('disruption')}
          setAttribute={this.setAttribute}
          options={config.disruptions}
        />
        <div className='controls-label'>Active</div>
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
        <div className='controls-label'>State</div>
        <StateRadioInput
          attribute='state'
          value={this.props.state}
          setState={this.props.setState}
          setStateName={this.props.setStateName}
          options={this.props.graph.get('states')}
        />
        <div className='controls-label'>Graph Title</div>
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

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

  instructions() {
    return (
      <div>
        <p>Start building your market map!</p>
        <ul>
          <li>Click an entity or connection to edit it.</li>
          <li>Drag entities to reposition them</li>
        </ul>

      </div>
    );
  },

  nodeControls() {
    const selected = this.props.selected;
    const section_title = selected.element === 'nodes' ?
      'Entity Properties' : 'Connection Properties';
    return (
      <div className='controls-section'>
        <h3>{section_title}</h3>

        <div className='form-section'>
          {selected.element === 'nodes' && this._nodeOnlyInputs()}
          {selected.element === 'edges' && this._edgeOnlyInputs()}
        </div>

        <div className='form-section'>

          <div className='form-section-note'>
            ↓ These properties may differ between states ↓
          </div>

          <label className='form-input'>
            <span className='form-label'>Number, Price, Volume</span>
            <TextInput
              placeholder='ex: N=100, P=$20'
              is_textarea={true}
              attribute='quantities'
              value={this.getAttribute('quantities')}
              setAttribute={this.setAttribute}
            />
          </label>

          <div className='form-input'>
            <span className='form-label'>Disruption</span>
            <RadioInput
              attribute='disruption'
              value={this.getAttribute('disruption')}
              setAttribute={this.setAttribute}
              options={config.disruptions}
            />
          </div>

          <label className='form-input'>
            <span className='form-label'>Active</span>
            <CheckBoxInput
              attribute='active'
              value={this.getAttribute('active')}
              setAttribute={this.setAttribute}
            />
            <span>This element is active</span>
          </label>
        </div>


        <button className='red inline button' onClick={this.props.removeElement}>Remove Node</button>
      </div>
    );
  },

  _nodeOnlyInputs() {
    return (
      <div>
        <div className='input-bar'>
          <label className='form-input'>
            <span className='form-label'>Type</span>
            <SelectInput
              attribute='type'
              value={this.getAttribute('type')}
              setAttribute={this.setAttribute}
              options={
                [].concat(
                  Object.keys(config.types[this.getAttribute('nodetype')])
                )
              }
            />
          </label>

          <label className='form-input'>
            <span className='form-label'>Subtype</span>
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
          </label>
        </div>

        <label className='form-input'>
          <span className='form-label'>Name</span>
          <TextInput
            attribute='name'
            placeholder='(optional)'
            value={this.getAttribute('name')}
            setAttribute={this.setAttribute}
          />
        </label>

        <div className='form-input'>
          <span className='form-label'>Color</span>
          <ColorInput
            value={this.getAttribute('color')}
            setAttribute={this.setAttribute}
          />
        </div>
      </div>
    );
  },

  _edgeOnlyInputs() {
    return (
      <div>
        <div className='form-input'>
          <span className='form-label'>Line Width</span>
          <NumberInput
            attribute='width'
            value={this.getAttribute('width')}
            setAttribute={this.setAttribute}
          />
        </div>

        <div className='form-input'>
          <span className='form-label'>Line Style</span>
          <SelectInput
            attribute='linestyle'
            value={this.getAttribute('linestyle')}
            setAttribute={this.setAttribute}
            options={
              [].concat(config.linestyles)
            }
          />
        </div>
      </div>
    );
  },

  graphControls() {
    return (
      <div id="graph-controls" className='controls-section'>
        <h3 className='controls-heading'>Graph</h3>
        <div className='form-input'>State</div>
        <StateRadioInput
          attribute='state'
          value={this.props.state}
          setState={this.props.setState}
          setStateName={this.props.setStateName}
          options={this.props.graph.get('states')}
        />
        <label className='form-input'>Graph Title</label>
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
        {selected === null && this.instructions()}
        {selected !== null && this.nodeControls()}
        {this.graphControls()}
      </div>
    );
  },
  render() {
    const toggle_icon = this.props.show_controls ? '\u00bb' : '\u00ab';
    return (
      <div id='controls' className='form'>
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

import React from 'react'
import TextInput from './inputs/text.jsx'
import ColorInput from './inputs/color.jsx'
import SelectInput from './inputs/select.jsx'
import RadioInput from './inputs/radio.jsx'
import StateRadioInput from './inputs/stateradio.jsx'
import NumberInput from './inputs/number.jsx'
import CheckBoxInput from './inputs/checkbox.jsx'
import ToolTip from './tooltip.jsx'
import Icon from './icon.jsx'
import config from '../config.json'
const createClass = React.createClass;

export default createClass({
  // shouldComponentUpdate(next_props) {
  //   return next_props.show_controls !== this.props.show_controls ||
  //     next_props.selected !== this.props.selected ||
  //     next_props.graph !== this.props.graph ||
  //     next_props.state !== this.props.state ||
  //     next_props.controls_state !== this.props.controls_state;
  // },
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

  generalControls() {
    return (
      <div>
        <div className='add-entity-buttons'>
          <a
            className='add-entity-button settings button magenta'
            href='#'
            onClick={this.props.showGraphControls}
          >
            <Icon name='cog'/>
          </a>


          <a
            className='add-entity-button environment button magenta'
            href='#'
            onClick={() => this.props.addNode('environment')}
          >
            <Icon name='plus'/>
          </a>
          <a
            className='add-entity-button chain button magenta'
            href='#'
            onClick={() => this.props.addNode('chain')}
          ><Icon name='plus'/></a>
          <a
            className='add-entity-button infrastructure button magenta'
            href='#'
            onClick={() => this.props.addNode('infrastructure')}
          ><Icon name='plus'/></a>
          <a
            className='add-entity-button note button magenta'
            href='#'
            onClick={this.props.addNote}
          ><Icon name='add-text'/></a>
        </div>
      </div>
    );
  },

  nodeControls() {
    const selected = this.props.selected;
    const el_type = selected.element === 'nodes' ? 'Entity' : 'Connection'
    return (
      <div className='controls-section'>
        <h3>Edit {el_type} Properties</h3>

        <div className='form-section'>
          {selected.element === 'nodes' && this._nodeOnlyInputs()}
          {selected.element === 'edges' && this._edgeOnlyInputs()}
        </div>

        <div className='form-section'>
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
            <span>{el_type} is active in this state</span>
          </label>
        </div>

        <div className='form-section'>
          <button className='red inline button' onClick={this.props.removeElement}>Remove {el_type}</button>
        </div>
      </div>
    );
  },

  _nodeOnlyInputs() {
    return (
      <div>
        <div className='input-bar' style={{display: 'none'}}>
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
        <div className='input-bar'>
          <div className='form-input'>
            <span className='form-label'>Line Width</span>
            <NumberInput
              attribute='width'
              min='1'
              max='15'
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
      </div>
    );
  },

  noteControls() {
    return (
      <div className='controls-section'>
        <h3>Edit Note Properties</h3>

        <div className='form-section'>

          <label className='form-input'>
            <span className='form-label'>Note contents</span>
            <TextInput
              placeholder='note text'
              is_textarea={true}
              attribute='text'
              value={this.getAttribute('text')}
              setAttribute={this.setAttribute}
            />
          </label>

        </div>

        <div className='form-section'>
          <button className='red inline button' onClick={this.props.removeElement}>Remove Note</button>
        </div>
      </div>
    );
  },

  getSetStateName(num) {
    return (e) => this.props.setStateName(num, e.target.value);
  },

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  },

  graphControls() {
    return (
      <div>
        <h3>Map Settings</h3>
        <div className='form-section'>
          <label className='form-input'>
            <span className='form-label'>Title</span>
            <TextInput
              attribute='title'
              placeholder='Ex: Commodity Name in Someplace, Country'
              value={this.props.graph.get('title')}
              setAttribute={this.props.setGraphAttribute}
            />
          </label>
        </div>

        <div className='form-section'>
          <span className='form-label'>Possible Market States</span>
          {this.props.graph.get('states').map((state, i) => {
            return (
              <div key={i} className='form-input'>
              <input
                placeholder='ex: drought, post-flood'
                type='text'
                value={state}
                onChange={this.getSetStateName(i)}
                onKeyPress={this.handleKeyPress}
              />
              </div>
            );
          })}
          <a
            className='button'
            href='#'
            onClick={this.props.addState}
          >
            Add state
          </a>
          {this.props.graph.get('states').size > 1 &&
          <a
            className='button'
            href='#'
            onClick={this.props.removeState}
          >
            Remove state
          </a>}
        </div>

        <div className='form-section'>
          <h4>Save / Export</h4>

          <a className='button' href='#' onClick={this.props.exportPNG}>
            Export Image (PNG)
          </a>
          <ToolTip>
            Save an image of your finalized map for inclusion in reports
          </ToolTip>

          <br/>

          <a className='button' href='#' onClick={this.props.exportJSON}>
            Export Project File
          </a>
          <ToolTip>
            Save an export of your map project for backup or to share with someone else for editing. When you are ready to work on it again, return to the welcome page, click on "LOAD A SAVED PROJECT FILE", and upload the exported file.
          </ToolTip>
        </div>

      </div>
    );
  },

  renderControls() {
    if (!this.props.show_controls) return null;
    const selected = this.props.selected;
    let controls;
    switch (this.props.controls_state) {
      case 'app':
        controls = this.generalControls();
        break;
      case 'graph':
        controls = this.graphControls();
        break;
      case 'element':
        controls = this.nodeControls();
        break;
      case 'note':
        controls = this.noteControls();
        break;
    }
    return <div>{controls}</div>;
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

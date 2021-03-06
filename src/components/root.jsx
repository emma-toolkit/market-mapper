import React from 'react'
import { Provider, connect } from 'react-redux'
import Promise from 'bluebird'
import creators from '../creators'
import NodeType from './nodetype.jsx'
import Graph from './graph.jsx'
import Legend from './legend.jsx'
import SplashPage from './splash.jsx'
import ConnectionOverlay from './overlays/connection.jsx'
import DisruptionOverlay from './overlays/disruption.jsx'
import NotesOverlay from './overlays/notes.jsx'
import StateRadioInput from './inputs/stateradio.jsx'
import Controls from './controls.jsx'
import DevTools from '../../dev/devtools.jsx'
import throttle from 'lodash.throttle'
const createClass = React.createClass

const App = connect(
  state => {return {state}},
  dispatch => {
    return {
      newGraph() {dispatch(creators.newGraph())},
      hideSplash() {dispatch(creators.hideSplash())},
      showSplash() {dispatch(creators.showSplash())},
      doLayout() {dispatch(creators.doLayout())},
      layoutDone(nodes) {dispatch(creators.layoutDone(nodes))},
      redraw() {dispatch(creators.redraw())},
      clear() {dispatch(creators.clear())},
      toggleControls(show_controls) {
        dispatch(creators.toggleControls(show_controls));
      },
      showGraphControls() {dispatch(creators.showGraphControls())},
      showLegendControls() {dispatch(creators.showLegendControls())},
      setState(num) {dispatch(creators.setState(num))},
      addState() {dispatch(creators.addState())},
      removeState(num) {dispatch(creators.removeState(num))},
      setStateName(num, name) {dispatch(creators.setStateName(num, name))},
      addNode(nodetype) {dispatch(creators.addNode(nodetype))},
      addNote() {dispatch(creators.addNote())},
      removeElement(selected) {dispatch(creators.removeElement(selected))},
      selectElement(element) {dispatch(creators.selectElement(element))},
      deselectElement() {dispatch(creators.deselectElement())},
      setOutHandle(nodetype, id, x, y) {
        dispatch(creators.setOutHandle(nodetype, id, x, y))
      },
      setInHandle(id, x, y) {dispatch(creators.setInHandle(id, x, y))},
      clearOutHandle() {dispatch(creators.clearOutHandle())},
      clearInHandle() {dispatch(creators.clearInHandle())},
      startConnecting() {dispatch(creators.startConnecting())},
      endConnecting() {dispatch(creators.endConnecting())},
      startDraggingNote(id) {dispatch(creators.startDraggingNote(id))},
      endDraggingNote(id, position) {dispatch(creators.endDraggingNote(id, position))},
      setDisruptions(disruptions) {
        dispatch(creators.setDisruptions(disruptions));
      },
      addEdge(nodetype, from_id, to_id) {
        dispatch(creators.addEdge(nodetype, from_id, to_id));
      },
      setElementAttribute(element, attribute, value, state_num) {
        dispatch(creators.setElementAttribute(element, attribute, value, state_num));
      },
      setGraphAttribute(attribute, value) {
        dispatch(creators.setGraphAttribute(attribute, value));
      },
      setColorLabel(color, label) {
        dispatch(creators.setColorLabel(color, label));
      },
      loadLocal(state) {dispatch(creators.loadLocal(state))},
      loadJSON(e) {dispatch(creators.loadJSON(e.target.files))},
      exportJSON(state) {dispatch(creators.exportJSON(state))},
      exportPNG(el, title, edited_at) {
        dispatch(creators.exportPNG(el, title, edited_at));
      }
   }
  }
)(createClass({
  getAppProp(prop) {
    return this.props.state.getIn(['app', prop]);
  },
  controlsShown() {
    return this.getAppProp('show_controls');
  },
  legendControlsShown() {
    return this.getAppProp('controls') === 'legend';
  },
  componentDidMount() {
    window.addEventListener('resize', throttle(this.props.redraw));
    window.onkeydown = e => {
      switch (e.code) {
        case 'Backspace':
          const active_type = document.activeElement.type;
          if (active_type !== 'text' && active_type !== 'textarea' && active_type !== 'number') {
            e.preventDefault();
            this.removeElement();
          }
          break;
        case 'Escape':
          this.props.deselectElement();
          break;
      }
    };
    this.props.loadLocal(this.props.state);
  },
  removeState() {
    const states = this.props.state.getIn(['graph', 'states']);
    this.props.removeState(states.size - 1);
  },
  exportJSON() {
    this.props.exportJSON(this.props.state);
  },
  exportPNG() {
    this.props.exportPNG(
      this.refs.display,
      this.props.state.getIn(['graph', 'title']),
      this.props.state.getIn(['graph', 'edited_at'])
    );
  },
  toggleControls() {this.props.toggleControls(!this.controlsShown())},
  removeElement() {
    const selected = this.getSelected();
    if (selected === null) return;
    let element;
    switch (selected.element) {
      case 'nodes':
        element = 'entity';
        break;
      case 'edges':
        element = 'connection';
        break;
      case 'notes':
        element = 'note';
        break;
    }
    if (confirm(`Are you sure you want to delete the selected ${element}?`)) {
      this.props.removeElement(selected);
    }
  },
  selectElement(selected) {
    this.props.selectElement(
      this.getRecordFromElement(selected)
    );
  },
  setElementAttribute(attribute, value) {
    this.props.setElementAttribute(this.getSelected(), attribute, value, this.getAppProp('state'));
  },
  getSelected() {
    return this.getAppProp('selected');
  },
  getInHandle() {
    return this.getAppProp('in_handle');
  },
  getOutHandle() {
    return this.getAppProp('out_handle');
  },
  getInHandle() {
    return this.getAppProp('in_handle');
  },
  getConnecting() {
    return this.getAppProp('connecting');
  },
  getRecordFromElement(element) {
    const data = element.data();
    return this.props.state.getIn([data.element, data.nodetype, data.id]);
  },
  getUsedColors() {
    const colors = [];
    this.props.state.get('nodes').forEach(nodetype => {
      nodetype.forEach(node => {
        const color = node.get('color');
        if (color !== '#FFFFFF' && colors.indexOf(color) === -1) {
          colors.push(color);
        }
      });
    });
    return colors;
  },
  handleMouseUp() {
    if (!this.getConnecting()) return;

    const in_handle = this.getInHandle();
    if (in_handle) {
      const out_handle = this.getOutHandle();
      this.props.endConnecting();
      this.props.clearOutHandle();
      this.props.clearInHandle();
      this.props.addEdge(
        out_handle.nodetype,
        out_handle.id,
        in_handle.id
      );
    } else {
      this.props.endConnecting();
      this.props.clearOutHandle();
    }
  },
  render() {
    const className = this.controlsShown() ?
      'controls-shown' : 'controls-hidden';
    const divClassName = this.getConnecting() ? 'connecting' : null;
    const title = this.props.state.getIn(['graph', 'title']);
    return (
      <div id='main-wrapper' className={className}>
        {this.getAppProp('show_splash') &&
        <SplashPage
          graph={this.props.state.get('graph')}
          created_at={this.props.state.getIn(['graph', 'created_at'])}
          edited_at={this.props.state.getIn(['graph', 'edited_at'])}
          hideSplash={this.props.hideSplash}
          loadJSON={this.props.loadJSON}
          newGraph={this.props.newGraph}
        />}
        <header id='header-bar'>
          <h1>
            <a onClick={this.props.showSplash}>
              Market System Map Builder
            </a>
          </h1>
        </header>
        <div
          id='display'
          className={divClassName}
          onMouseUp={this.handleMouseUp}
          ref='display'
        >
          <div id='graph-header'>
            <h1 id='graph-title' onClick={this.props.showGraphControls}>
              {title}
            </h1>
            <StateRadioInput
              states={this.props.state.getIn(['graph', 'states'])}
              state={this.getAppProp('state')}
              setState={this.props.setState}
            />
          </div>
          <div id='background'>
            <NodeType nodetype='environment' />
            <NodeType nodetype='chain' />
            <NodeType nodetype='infrastructure' />
          </div>
          <NotesOverlay
            notes={this.props.state.get('notes')}
            dragging={this.getAppProp('dragging_note')}
            selected={this.getSelected()}
            startDragging={this.props.startDraggingNote}
            endDragging={this.props.endDraggingNote}
            setPosition={this.props.setNotePosition}
            selectNote={this.props.selectElement}
          />
          <ConnectionOverlay
            out_handle={this.getOutHandle()}
            in_handle={this.getInHandle()}
            startConnecting={this.props.startConnecting}
            endConnecting={this.props.endConnecting}
            connecting={this.getConnecting()}
          />
          <DisruptionOverlay
            disruptions={this.props.state.getIn(['app', 'disruptions'])}
            edges={this.props.state.get('edges')}
          />
          <Graph
            state={this.props.state}
            layoutDone={this.props.layoutDone}
            selectElement={this.selectElement}
            deselectElement={this.props.deselectElement}
            getSelected={this.getSelected}
            getOutHandle={this.getOutHandle}
            getInHandle={this.getInHandle}
            getConnecting={this.getConnecting}
            setOutHandle={this.props.setOutHandle}
            setInHandle={this.props.setInHandle}
            clearOutHandle={this.props.clearOutHandle}
            clearInHandle={this.props.clearInHandle}
            setDisruptions={this.props.setDisruptions}
          />
          <Legend
            legend={this.props.state.getIn(['graph', 'legend'])}
            colors={this.getUsedColors()}
            showLegendControls={this.props.showLegendControls}
            legend_controls_shown={this.legendControlsShown()}
          />
        </div>
        <Controls
          graph={this.props.state.get('graph')}
          selected={this.getSelected()}
          state={this.getAppProp('state')}
          setState={this.props.setState}
          addState={this.props.addState}
          removeState={this.removeState}
          setStateName={this.props.setStateName}
          show_controls={this.controlsShown()}
          controls_state={this.getAppProp('controls')}
          showGraphControls={this.props.showGraphControls}
          setGraphAttribute={this.props.setGraphAttribute}
          loadJSON={this.props.loadJSON}
          doLayout={this.props.doLayout}
          clear={this.props.clear}
          exportJSON={this.exportJSON}
          exportPNG={this.exportPNG}
          toggleControls={this.toggleControls}
          removeElement={this.removeElement}
          setElementAttribute={this.setElementAttribute}
          setNoteAttribute={this.setNoteAttribute}
          addNode={this.props.addNode}
          addNote={this.props.addNote}
          setStateName={this.props.setStateName}
          colors={this.getUsedColors()}
          legend={this.props.state.getIn(['graph', 'legend'])}
          setColorLabel={this.props.setColorLabel}
        />
      </div>
    );
  }
}));

export default createClass({
  render() {
    const devtools = process.env.NODE_ENV === 'development' ?
      <DevTools /> :
      null;
    return (
      <Provider store={this.props.store}>
        <div><App />{devtools}</div>
      </Provider>
    );
  }
});

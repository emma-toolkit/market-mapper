import React from 'react'
import { Provider, connect } from 'react-redux'
import Promise from 'bluebird'
import creators from '../creators'
import NodeType from './nodetype.jsx'
import Graph from './graph.jsx'
import ConnectionOverlay from './overlays/connection.jsx'
import DisruptionOverlay from './overlays/disruption.jsx'
import Controls from './controls.jsx'
import DevTools from '../../dev/devtools.jsx'
import throttle from 'lodash.throttle'
const createClass = React.createClass

const App = connect(
  state => {return {state}},
  dispatch => {
    return {
      doLayout() {dispatch(creators.doLayout())},
      layoutDone(nodes) {dispatch(creators.layoutDone(nodes))},
      redraw() {dispatch(creators.redraw())},
      clear() {dispatch(creators.clear())},
      toggleControls(show_controls) {
        dispatch(creators.toggleControls(show_controls));
      },
      setState(num) {dispatch(creators.setState(num))},
      addNode(nodetype) {dispatch(creators.addNode(nodetype))},
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
      setDisruptions(disruptions) {
        dispatch(creators.setDisruptions(disruptions));
      },
      addEdge(nodetype, from_id, to_id) {
        dispatch(creators.addEdge(nodetype, from_id, to_id));
      },
      setElementAttribute(element, attribute, value) {
        dispatch(creators.setElementAttribute(element, attribute, value));
      },
      setGraphAttribute(attribute, value) {
        dispatch(creators.setGraphAttribute(attribute, value));
      },
      loadLocal(state) {dispatch(creators.loadLocal(state))},
      loadJSON(e) {dispatch(creators.loadJSON(e.target.files))},
      exportJSON(state) {dispatch(creators.exportJSON(state))}
   }
  }
)(createClass({
  getAppProp(prop) {
    return this.props.state.getIn(['app', prop]);
  },
  controlsShown() {
    return this.getAppProp('show_controls');
  },
  componentDidMount() {
    window.addEventListener('resize', throttle(this.props.redraw));
    window.onkeydown = e => {
      switch (e.code) {
        case 'Backspace':
          const active_type = document.activeElement.type;
          if (active_type !== 'text' && active_type !== 'textarea') {
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
  exportJSON() {
    this.props.exportJSON(this.props.state);
  },
  toggleControls() {this.props.toggleControls(!this.controlsShown())},
  removeElement() {
    const selected = this.getSelected();
    if (selected === null) return;
    const element = selected.element === 'nodes' ? 'node' : 'edge';
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
    this.props.setElementAttribute(this.getSelected(), attribute, value);
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
      <div className={className}>
        <div
          id='display'
          className={divClassName}
          style={{height: window.innerHeight}}
          onMouseUp={this.handleMouseUp}
        >
          {title !== null && <h1 id='graph-title'>{title}</h1>}
          <div id='background'>
            <NodeType nodetype='environment' addNode={this.props.addNode} />
            <NodeType nodetype='chain' addNode={this.props.addNode} />
            <NodeType nodetype='infrastructure' addNode={this.props.addNode} />
          </div>
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
        </div>
        <Controls
          graph={this.props.state.get('graph')}
          selected={this.getSelected()}
          state={this.getAppProp('state')}
          setState={this.props.setState}
          show_controls={this.controlsShown()}
          setGraphAttribute={this.props.setGraphAttribute}
          loadJSON={this.props.loadJSON}
          doLayout={this.props.doLayout}
          clear={this.props.clear}
          exportJSON={this.exportJSON}
          toggleControls={this.toggleControls}
          removeElement={this.removeElement}
          setElementAttribute={this.setElementAttribute}
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

import React from 'react'
import { Provider, connect } from 'react-redux'
import Promise from 'bluebird'
import creators from '../creators'
import NodeType from './nodetype.jsx'
import Graph from './graph.jsx'
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
      addNode(nodetype) {dispatch(creators.addNode(nodetype))},
      removeNode(selected) {dispatch(creators.removeNode(selected))},
      selectNode(node) {dispatch(creators.selectNode(node))},
      deselectNode() {dispatch(creators.deselectNode())},
      targetNode(node) {dispatch(creators.targetNode(node))},
      untargetNode() {dispatch(creators.untargetNode())},
      addEdge(from, to) {dispatch(creators.addEdge(from, to))},
      loadLocal(state) {dispatch(creators.loadLocal(state))},
      loadCSV(e) {dispatch(creators.loadCSV(e.target.files))},
      exportCSV(state) {dispatch(creators.exportCSV(state))}
   }
  }
)(createClass({
  controlsShown() {return this.props.state.getIn(['app', 'show_controls'])},
  componentDidMount() {
    window.addEventListener('resize', throttle(this.props.redraw));
    this.props.loadLocal(this.props.state);
  },
  exportCSV() {
    this.props.exportCSV(this.props.state);
  },
  toggleControls() {this.props.toggleControls(!this.controlsShown())},
  removeNode() {
    const selected = this.getSelected();
    if (selected === null) return;
    if (confirm(`Are you sure you want to delete the node "${selected.name}"?`)) {
      this.props.removeNode(selected);
    }
  },
  selectNode(selected) {
    this.props.selectNode(
      this.getRecordFromNode(selected)
    );
  },
  targetNode(targeted) {
    this.props.targetNode(
      this.getRecordFromNode(targeted)
    );
  },
  addEdge() {
    this.props.addEdge(this.getSelected(), this.getTargeted());
  },
  getSelected() {
    return this.props.state.getIn(['app', 'selected']);
  },
  getTargeted() {
    return this.props.state.getIn(['app', 'targeted']);
  },
  getRecordFromNode(node) {
    const data = node.data();
    return this.props.state.getIn(['nodes', data.parent, data.id]);
  },
  render() {
    const className = this.controlsShown() ?
      'controls-shown' : 'controls-hidden';
    return (
      <div className={className}>
        <div id='display' style={{height: window.innerHeight}}>
          <div id='background'>
            <NodeType nodetype='environment' addNode={this.props.addNode} />
            <NodeType nodetype='chain' addNode={this.props.addNode} />
            <NodeType nodetype='infrastructure' addNode={this.props.addNode} />
          </div>
          <Graph
            state={this.props.state}
            layoutDone={this.props.layoutDone}
            selectNode={this.selectNode}
            deselectNode={this.props.deselectNode}
            targetNode={this.targetNode}
            untargetNode={this.props.untargetNode}
            getSelected={this.getSelected}
            getTargeted={this.getTargeted}
            addEdge={this.addEdge}
          />
        </div>
        <Controls
          selected={this.getSelected()}
          show_controls={this.controlsShown()}
          loadCSV={this.props.loadCSV}
          doLayout={this.props.doLayout}
          clear={this.props.clear}
          exportCSV={this.exportCSV}
          toggleControls={this.toggleControls}
          removeNode={this.removeNode}
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

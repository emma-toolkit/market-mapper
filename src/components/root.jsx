import React from 'react'
import { Provider, connect } from 'react-redux'
import Promise from 'bluebird'
import creators from '../creators'
import NodeType from './nodetype.jsx'
import Graph from './graph.jsx'
import Edges from './edges.jsx'
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
      removeElement(selected) {dispatch(creators.removeElement(selected))},
      selectElement(element) {dispatch(creators.selectElement(element))},
      deselectElement() {dispatch(creators.deselectElement())},
      showHandle(x, y) {dispatch(creators.showHandle(x, y))},
      hideHandles() {dispatch(creators.hideHandles())},
      startConnecting() {dispatch(creators.startConnecting())},
      endConnecting() {dispatch(creators.endConnecting())},
      // targetNode(node) {dispatch(creators.targetNode(node))},
      // untargetNode() {dispatch(creators.untargetNode())},
      // addEdge(from, to) {dispatch(creators.addEdge(from, to))},
      setNodeAttribute(node, attribute, value) {
        dispatch(creators.setNodeAttribute(node, attribute, value));
      },
      setGraphAttribute(attribute, value) {
        dispatch(creators.setGraphAttribute(attribute, value));
      },
      loadLocal(state) {dispatch(creators.loadLocal(state))},
      loadCSV(e) {dispatch(creators.loadCSV(e.target.files))},
      exportCSV(state) {dispatch(creators.exportCSV(state))}
   }
  }
)(createClass({
  controlsShown() {return this.props.state.getIn(['app', 'show_controls'])},
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
  exportCSV() {
    this.props.exportCSV(this.props.state);
  },
  toggleControls() {this.props.toggleControls(!this.controlsShown())},
  removeElement() {
    const selected = this.getSelected();
    if (selected === null) return;
    const type = selected.type === 'nodes' ? 'node' : 'edge';
    if (confirm(`Are you sure you want to delete the selected ${type}?`)) {
      this.props.removeElement(selected);
    }
  },
  selectElement(selected) {
    this.props.selectElement(
      this.getRecordFromElement(selected)
    );
  },
  // targetNode(targeted) {
  //   this.props.targetNode(
  //     this.getRecordFromElement(targeted)
  //   );
  // },
  // addEdge() {
  //   this.props.addEdge(this.getSelected(), this.getTargeted());
  // },
  setNodeAttribute(attribute, value) {
    this.props.setNodeAttribute(this.getSelected(), attribute, value);
  },
  getSelected() {
    return this.props.state.getIn(['app', 'selected']);
  },
  // getTargeted() {
  //   return this.props.state.getIn(['app', 'targeted']);
  // },
  getHandle() {
    return this.props.state.getIn(['app', 'handle']);
  },
  getRecordFromElement(element) {
    const data = element.data();
    return this.props.state.getIn([data.type, data.nodetype, data.id]);
  },
  render() {
    const className = this.controlsShown() ?
      'controls-shown' : 'controls-hidden';
    const title = this.props.state.getIn(['graph', 'title']);
    return (
      <div className={className}>
        <div id='display' style={{height: window.innerHeight}}>
          {title !== null && <h1 id='graph-title'>{title}</h1>}
          <div id='background'>
            <NodeType nodetype='environment' addNode={this.props.addNode} />
            <NodeType nodetype='chain' addNode={this.props.addNode} />
            <NodeType nodetype='infrastructure' addNode={this.props.addNode} />
          </div>
          <Edges
            handle={this.getHandle()}
            startConnecting={this.props.startConnecting}
            endConnecting={this.props.endConnecting}
            connecting={this.props.state.getIn(['app', 'connecting'])}
          />
          <Graph
            state={this.props.state}
            layoutDone={this.props.layoutDone}
            selectElement={this.selectElement}
            deselectElement={this.props.deselectElement}
            // targetNode={this.targetNode}
            // untargetNode={this.props.untargetNode}
            getSelected={this.getSelected}
            // getTargeted={this.getTargeted}
            // addEdge={this.addEdge}
            getHandle={this.getHandle}
            showHandle={this.props.showHandle}
            hideHandles={this.props.hideHandles}
          />
        </div>
        <Controls
          graph={this.props.state.get('graph')}
          selected={this.getSelected()}
          show_controls={this.controlsShown()}
          setGraphAttribute={this.props.setGraphAttribute}
          loadCSV={this.props.loadCSV}
          doLayout={this.props.doLayout}
          clear={this.props.clear}
          exportCSV={this.exportCSV}
          toggleControls={this.toggleControls}
          removeElement={this.removeElement}
          setNodeAttribute={this.setNodeAttribute}
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

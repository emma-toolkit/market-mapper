import React from 'react'
import { Provider, connect } from 'react-redux'
import Promise from 'bluebird'
import creators from '../creators'
import Domain from './domain.jsx'
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
      addNode(domain) {dispatch(creators.addNode(domain))},
      loadLocal(state) {dispatch(creators.loadLocal(state))},
      loadCSV(e) {dispatch(creators.loadCSV(e.target.files))},
      exportCSV(state) {dispatch(creators.exportCSV(state))}
   }
  }
)(createClass({
  getInitialState() {
    return {selected: null}
  },
  controlsShown() {return this.props.state.getIn(['app', 'show_controls'])},
  componentDidMount() {
    window.addEventListener('resize', throttle(this.props.redraw));
    this.props.loadLocal(this.props.state);
  },
  exportCSV() {
    this.props.exportCSV(this.props.state);
  },
  toggleControls() {this.props.toggleControls(!this.controlsShown())},
  inspectNode(domain, id) {
    this.setState({selected: this.props.state.getIn(['nodes', domain, id])})
  },
  uninspectNode() {this.setState({selected: null})},
  render() {
    const className = this.controlsShown() ?
      'controls-shown' : 'controls-hidden';
    return (
      <div className={className}>
        <div id='display' style={{height: window.innerHeight}}>
          <div id='background'>
            <Domain domain='environment' addNode={this.props.addNode} />
            <Domain domain='chain' addNode={this.props.addNode} />
            <Domain domain='infrastructure' addNode={this.props.addNode} />
          </div>
          <Graph
            state={this.props.state}
            layoutDone={this.props.layoutDone}
            inspectNode={this.inspectNode}
            uninspectNode={this.uninspectNode}
          />
        </div>
        <Controls
          selected={this.state.selected}
          show_controls={this.controlsShown()}
          loadCSV={this.props.loadCSV}
          doLayout={this.props.doLayout}
          clear={this.props.clear}
          exportCSV={this.exportCSV}
          toggleControls={this.toggleControls}
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

import React from 'react'
import { Provider, connect } from 'react-redux'
import creators from './creators'
import DevTools from '../dev/devtools.jsx'
const createClass = React.createClass

const Graph = createClass({
  componentDidMount() {
    if (this.hasNodes(this.props)) this.layoutGraph();
  },
  shouldComponentUpdate(next_props) {
    return this.hasNodes(next_props) && !this.hasNodes(this.props);
  },
  componentDidUpdate() {
    this.layoutGraph();
  },
  hasNodes(props) {
    const nodes = props.state.get('nodes');
    return (
      nodes.get('environment').size ||
      nodes.get('chain').size ||
      nodes.get('infrastructure').size
    ) !== 0;
  },
  layoutGraph() {
    this.props.layoutGraph(this.refs.div, this.props.state);
  },
  render() {
    return <div id='graph' ref='div' />;
  }
});

const App = connect(
  state => {return {state}},
  dispatch => {
    return {
      loadCSV(e) {dispatch(creators.loadCSV(e.target.files))},
      layoutGraph(div, state) {dispatch(creators.layoutGraph(div, state))},
      exportCSV(state) {dispatch(creators.exportCSV(state))}
   }
  }
)(createClass({
  exportCSV() {
    this.props.exportCSV(this.props.state);
  },
  render() {
    return (
      <div style={{height: window.innerHeight}}>
        <div id='background'>
          <div id='environment' />
          <div id='chain' />
          <div id='infrastructure' />
        </div>
        <Graph state={this.props.state} layoutGraph={this.props.layoutGraph} />
        <div id='ui'>
          <input type='file' name='csv' onChange={this.props.loadCSV} />
          <button onClick={this.exportCSV}>Export</button>
        </div>
      </div>
    );
  }
}));

export const Root = createClass({
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

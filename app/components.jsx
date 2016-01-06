import React from 'react'
import { Provider, connect } from 'react-redux'
import creators from './creators'
import DevTools from '../dev/devtools.jsx'
const createClass = React.createClass

const App = connect(
  function(state) {
    return {
      environment: state.get('environment'),
      chain: state.get('chain'),
      infrastructure: state.get('infrastructure')
    };
  },
  function(dispatch) {
    return {
      layoutGraph: (data, div) => dispatch(creators.layoutGraph(data, div)),
      exportData: (data) => dispatch(creators.exportData(data))
    }
  }
)(createClass({
  getData: function() {
    return {
      environment: this.props.environment,
      chain: this.props.chain,
      infrastructure: this.props.infrastructure
    };
  },
  exportData: function() {
    this.props.exportData(this.getData());
  },
  componentDidMount: function() {
    this.props.layoutGraph(this.getData(), this.refs.graph);
  },
  render: function() {
    return (
      <div style={{height: window.innerHeight}}>
        <div id='background'>
          <div id='environment' />
          <div id='chain' />
          <div id='infrastructure' />
        </div>
        <div id='graph' ref='graph' />
        <div id='ui'>
          <button onClick={this.exportData}>Export</button>
        </div>
      </div>
    );
  }
}));

export const Root = createClass({
  render: function() {
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

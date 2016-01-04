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
      layoutGraph: (data, div) => dispatch(creators.layoutGraph(data, div))
    }
  }
)(createClass({
  componentDidMount: function() {
    const data = {
      environment: this.props.environment,
      chain: this.props.chain,
      infrastructure: this.props.infrastructure
    };
    this.props.layoutGraph(data, this.refs.graph);
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

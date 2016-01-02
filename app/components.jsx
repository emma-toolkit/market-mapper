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
      layoutGraph: function(environment, chain, infrastructure, div) {
        dispatch(creators.layoutGraph(
          environment,
          chain,
          infrastructure,
          div
        ));
      }
    }
  }
)(createClass({
  componentDidMount: function() {
    this.props.layoutGraph(
      this.props.environment,
      this.props.chain,
      this.props.infrastructure,
      this.refs.graph
    );
  },
  render: function() {
    return <div id='graph' style={{height: window.innerHeight}} ref='graph' />;
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

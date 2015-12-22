import React from 'react'
import D3 from 'd3'
import { Provider, connect } from 'react-redux'
import DevTools from '../dev/devtools.jsx'
const createClass = React.createClass

const Container = createClass({
  componentDidMount: function() {
    D3.select(`#${this.props.id}`).selectAll('div')
      .data(this.props.data.toArray())
      .enter().append('div')
      .attr('class', 'node')
      .text(d => d.name);
  },
  render: function() {
    return <div id={this.props.id} className='container' />
  }
});

const App = connect(
  function(state) {
    return {
      environment: state.get('environment'),
      chain: state.get('chain'),
      infrastructure: state.get('infrastructure')
    };
  }
)(createClass({
  render: function() {
    return (
      <div id='chart' style={{height: `${window.innerHeight}px`}}>
        <Container id='environment' data={this.props.environment} />
        <Container id='chain' data={this.props.chain} />
        <Container id='infrastructure' data={this.props.infrastructure} />
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

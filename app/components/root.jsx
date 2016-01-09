import React from 'react'
import { Provider, connect } from 'react-redux'
import creators from '../creators'
import Graph from './graph.jsx'
import DevTools from '../../dev/devtools.jsx'
const createClass = React.createClass

const App = connect(
  state => {return {state}},
  dispatch => {
    return {
      loadCSV(e) {dispatch(creators.loadCSV(e.target.files))},
      doLayout() {dispatch(creators.doLayout())},
      layoutDone() {dispatch(creators.layoutDone())},
      clear() {dispatch(creators.clear())},
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
        <Graph state={this.props.state} layoutDone={this.props.layoutDone} />
        <div id='ui'>
          <input type='file' name='csv' onChange={this.props.loadCSV} />
          <button onClick={this.props.doLayout}>Auto Layout</button>
          <button onClick={this.props.clear}>Clear</button>
          <button onClick={this.exportCSV}>Export</button>
        </div>
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

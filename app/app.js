import React from 'react'
import ReactDOM from 'react-dom'
import { Root } from './components.jsx'
import store from './store'
import creators from './creators'

document.addEventListener('DOMContentLoaded', function() {
  // Append wrapper.
  const div = document.createElement('DIV');
  document.body.appendChild(div);

  // Render app.
  const root = React.createElement(Root, {store: store});
  ReactDOM.render(root, div);
});
store.dispatch(creators.loadNodes());

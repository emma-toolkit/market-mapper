import React from 'react'
import ReactDOM from 'react-dom'
import analytics from 'react-ga'
import offline_plugin from 'offline-plugin/runtime'
import Root from './components/root.jsx'
import store from './store'
import config from './config.json'

if (process.env.NODE_ENV === 'production') {
  analytics.initialize(config.analytics)
  offline_plugin.install();
}

document.addEventListener('DOMContentLoaded', () => {

  const is_mac = !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i);
  document.body.classList.add(is_mac ? 'mac' : 'not-mac');

  // Append wrapper.
  const div = document.createElement('DIV');
  document.body.appendChild(div);

  // Render app.
  const root = React.createElement(Root, {store: store});
  ReactDOM.render(root, div);

  if (process.env.NODE_ENV === 'production') {
    analytics.pageview('/');
  }
});

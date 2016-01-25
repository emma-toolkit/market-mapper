import { DefinePlugin, optimize } from 'webpack'
import HTMLWebpackPlugin from 'html-webpack-plugin';
import OfflinePlugin from 'offline-plugin'

const entry = {
  css: './styles/app.styl',
  vendor: [
    'bluebird',
    'cytoscape',
    'cytoscape-dagre',
    'dagre',
    'fast-csv',
    'immutable',
    'localforage',
    'lodash.debounce',
    'lodash.throttle',
    'offline-plugin/runtime',
    'react',
    'react-dom',
    'react-redux',
    'redux',
    'redux-actions',
    'redux-immutablejs',
    'redux-promise'
  ],
  app: './app.js'
};
const commons = ['vendor'];
const plugins = [
  new DefinePlugin({
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`
  }),
  new HTMLWebpackPlugin({title: 'EMMA Toolkit'})
];
if (process.env.NODE_ENV === 'development') {
  entry.dev = [
    'redux-devtools',
    'redux-devtools-dock-monitor',
    'redux-devtools-log-monitor'
  ];
  commons.push('dev');
  plugins.push(new OfflinePlugin());
}
plugins.push(new optimize.CommonsChunkPlugin({names: commons}));

export default {
  context: `${process.cwd()}/src`,
  entry,
  output: {
    path: './build',
    filename: '[name].js'
  },
  module: {
    preLoaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader' }
    ],
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.jsx$/, loaders: ['react-hot', 'babel']},
      { test: /\.json$/, loader: 'json' },
      { test: /^((?!graph).)*\.styl$/, loaders: ['style', 'css', 'stylus'] },
      { test: /graph\.styl$/, loaders: ['css?-minimize', 'stylus'] }
    ]
  },
  plugins,
  devServer: {
    contentBase: './build'
  },
  node: {
    fs: 'empty'
  },
  eslint: {
    configFile: './.eslintrc',
    emitError: process.env.NODE_ENV === 'production'
  }
};

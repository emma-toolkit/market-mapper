import { DefinePlugin } from 'webpack'
import HTMLWebpackPlugin from 'html-webpack-plugin';

export default {
  context: `${process.cwd()}/app`,
  entry: {
    index: './index.js',
    app: './app.js'
  },
  output: {
    path: './build',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.json$/, loader: 'json' },
      { test: /\.css$/, loaders: ['style', 'css'] },
      { test: /\.styl$/, loaders: ['style', 'css', 'stylus'] }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({title: 'EMMA Toolkit'}),
    new DefinePlugin({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`
    })
  ],
  devServer: {
    contentBase: './build'
  }
};

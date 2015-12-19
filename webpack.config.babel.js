import HTMLWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: {
    app: './app.js'
  },
  output: {
    path: './build',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel' }
    ]
  },
  plugins: [new HTMLWebpackPlugin({
    title: 'EMMA Toolkit'
  })],
  devServer: {
    contentBase: './build'
  }
};

const path = require('path');
const outputDir = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    'background': ['@babel/polyfill', path.resolve(__dirname, './cmd/background.js')],
    'li-recruiter-profile-page': ['@babel/polyfill', path.resolve(__dirname, './cmd/li-recruiter-profile-page.js')],
    'options': ['@babel/polyfill', path.resolve(__dirname, './cmd/options.js')]
  },
  output: {
    path: outputDir,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}

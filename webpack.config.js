const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './demo/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [
      ".tsx",
      ".ts",
      ".js"
    ]
  },
  output: {
    filename: 'index.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'demo/index.html'
    })
  ]
};
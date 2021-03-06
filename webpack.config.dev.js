const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist'
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['dist']),
    //new ExtractTextPlugin("../dev.css"),
    new webpack.HotModuleReplacementPlugin(),
    //new webpack.ProvidePlugin({
      //shaka: 'script-loader!shaka-player/dist/shaka-player.compiled.js'
    //}),
  ],
  "devServer": {
    "contentBase": "./",
    open: true,
    hot: true,
    inline: true,
    publicPath: path.resolve(__dirname, '/dist/'),
    host: '0.0.0.0',
    //disableHostCheck: true,
  },
  watchOptions: {
    poll: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test:/\.scss$/,
        use:[
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS
        ]
      },
      {
        test:/\.scss.dev$/,
        use:[
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          //presets: ['es2015'],
          //presets: ['env'],

          presets: [
            ["env", {
              "targets": {
                "browsers": [
                  "last 2 versions",
                  "safari >= 7",
                  "ie >= 10"
                ],

              },
              "debug": true,
              "include": ["es6.array.from"],
            }]
          ],

          //presets: ['@babel/preset-env'],

        },
        exclude: [/node_modules\/hls/],
        //include: [/node_modules\/MY_MODULE/]
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      }
    ],

  },
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { resolve } = require('path');

let appPath = path.resolve(__dirname, 'src/app');
let serverPath = path.resolve(__dirname, 'src/server');
module.exports = {
  entry: appPath + '/index.tsx',
  output: {
    path: appPath + '/dist',
    filename: 'index.bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.html?$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: "less-loader",
            options: {
            },
          },
        ],
        // exclude: '/node_modules/',
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          // {
          //     loader: 'url-loader',
          //     options: {
          //         limit: 100000,
          //         name: '[name].[ext]',
          //         outputPath: './static',
          //         pulicPath: '/static',
          //     },
          // },
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: './static',
              pulicPath: '/static',
            },
          },
        ],
      },
    ],
  },
  devtool: 'cheap-module-source-map',
  devServer: {
      proxy: {
          '/api': {
              target: 'http://localhost:8899',
          },
      },
      port: 8899,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      "@containers": path.resolve(__dirname, 'src/app/containers'),
      '@components': path.resolve(__dirname, 'src/app/components'),
      "@containers": path.resolve(__dirname, 'src/app/containers'),
      "@reducers": path.resolve(__dirname, 'src/app/reducers'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '协同编辑-你可以的',
      filename: 'index.html',
      template: appPath + '/public/index.html',
    }),
    new MiniCssExtractPlugin(),
  ],
};
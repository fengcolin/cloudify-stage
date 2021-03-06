'use strict';

const webpack = require('webpack');
const path = require('path');
const glob = require('glob');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const Consts = require('./backend/consts');

const getWidgetEntries = () => {
    return glob.sync('./widgets/*/src/widget.js').reduce((acc, item) => {
        let name = item.replace('./widgets/', '').replace('/src', '');
        acc[name] = item;
        return acc;
    }, {});
}

const rules = [
    {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [{
            loader: 'babel-loader',
            options: {
                presets: [['env', {modules: false}], 'react', 'stage-0'],
                plugins: ['react-hot-loader/babel', 'transform-runtime'],
                babelrc: false
            }
        }]
    }, {
        test: /\.scss$/,
        use: [{
            loader: 'style-loader'
        }, {
            loader: 'css-loader',

            options: {
                minimize: true
            }
        }, {
            loader: 'sass-loader',

            options: {
                modules: true,
                localIdentName: '[name]---[local]---[hash:base64:5]'
            }
        }]
    }, {
        test: /\.css$/,
        use: [{
            loader: 'style-loader'
        }, {
            loader: 'css-loader',

            options: {
                importLoaders: 1,
                minimize: true
            }
        }]
    }, {
        test: /\.(eot|woff|woff2|ttf)(\?\S*)?$/,
        use: [{
            loader: 'url-loader',

            options: {
                limit: 100000,
                name: 'fonts/[name].[ext]'
            }
        }]
    }, {
        test: /\.(svg|png|jpe?g|gif)(\?\S*)?$/,
        use: [{
            loader: 'url-loader',

            options: {
                limit: 100000,
                name: 'images/[name].[ext]'
            }
        }]
    }
];

module.exports = [
    {
        mode: 'development',
        context: path.join(__dirname),
        devtool: 'eval',
        resolve: {
            alias: {
                'jquery-ui': 'jquery-ui/ui',
                'jquery': __dirname + '/node_modules/jquery' // Always make sure we take jquery from the same place
            }
        },
        entry: {
            'main.bundle': [
                './app/main.js'
            ]
        },
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'js/[name].js',
            publicPath: Consts.CONTEXT_PATH
        },
        plugins: [
            new CopyWebpackPlugin([
                {
                    from: 'app/images',
                    to: 'images'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: 'widgets',
                    to: 'appData/widgets',
                    ignore: ['**/src/*', '*/widget.js', '*/backend.js', '*/common.js']
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: 'templates',
                    to: 'appData/templates'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: 'tours',
                    to: 'appData/tours'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: 'userData',
                    to: 'userData'
                }
            ]),
            new HtmlWebpackPlugin({
                template: 'app/index.tmpl.html',
                inject: 'body',
                filename: 'index.html',
                chunks: ['main.bundle']
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                d3: 'd3'
            })
        ],
        module: {
            rules
        }
    },
    {
        mode: 'development',
        context: path.join(__dirname),
        devtool: 'eval',
        entry: getWidgetEntries(),
        output: {
            path: path.join(__dirname, 'dist/appData'),
            filename: 'widgets/[name]',
            publicPath: Consts.CONTEXT_PATH
        },
        plugins: [
            new CopyWebpackPlugin([
                {
                    from: 'widgets/**/src/backend.js',
                    to: '[path]../backend.js'
                }
            ]),
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin()
        ],
        module: {
            rules
        }
    },
    {
        mode: 'development',
        context: path.join(__dirname),
        devtool: 'eval',
        entry: glob.sync('./widgets/common/src/*.js'),
        output: {
            path: path.join(__dirname, 'dist/appData/widgets'),
            filename: 'common/common.js',
            publicPath: Consts.CONTEXT_PATH
        },
        plugins: [
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin()
        ],
        module: {
            rules
        }
    }
];
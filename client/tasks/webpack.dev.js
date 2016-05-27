
                var webpack = require('webpack');
                var path    = require('path');

                module.exports = {
                    devtool: 'source-map',
                    entry: {"demo-socket":"/Users/lixinliang/Coding/space-war/client/src/entry/demo-socket.js","index":"/Users/lixinliang/Coding/space-war/client/src/entry/index.js"},
                    output: {
                        filename: '[name].js',
                        publicPath: 'js/',
                        path: './src/js',
                    },
                    module: {
                        loaders: [
                            
                        {
                            test: /.js$/,
                            exclude: /(node_modules|bower_components)/,
                            include: path.join(__dirname, '../src/entry/'),
                            loader: 'babel',
                            query: {
                                presets: ['es2015', 'stage-0'],
                                // plugins: ['transform-runtime'],
                            }
                        },
            
                            {
                                test: /.html$/,
                                loader: 'html'
                            },
                            {
                                test: /.scss$/,
                                include: path.join(__dirname, '../src/entry/'),
                                loaders: ['css', 'autoprefixer', 'sass'],
                            },
                            {
                                test: /.(png|jpg|gif|svg)$/,
                                loader: 'url?limit=10240&name=/img/[name].[ext]?[hash]'
                            },
                            {
                                test: /.tpl$/,
                                exclude: /(node_modules|bower_components)/,
                                include: path.join(__dirname, '../src/entry/tpl/'),
                                loader: 'tmodjs',
                            },
                        ]
                    },
                    resolve: {
                        alias: {},
                        extensions:['','.js','.json'],
                    },
                    plugins: [
                        new webpack.ProvidePlugin({}),
                        new webpack.optimize.UglifyJsPlugin({
                            compress: {
                                warnings: false
                            }
                        }),
                    ]
                };
            
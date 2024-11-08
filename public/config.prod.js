const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
// const Dotenv = require('dotenv-webpack');

const line = "---------------------------------------------------------";
const msg = `FisherMan Climbing Slot Game`;
process.stdout.write(`${line}\n${msg}\n${line}\n`);
module.exports = {
    mode: "production",
    entry: "./src/scripts/index.ts",
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: "./bundle.min.js"
    },
    devtool: false,
    performance: {
        maxEntrypointSize: 2500000,
        maxAssetSize: 1200000
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader"
                }
              },
              { test: /\.tsx?$/, loader: 'ts-loader' },
              {
                test: [/\.vert$/, /\.frag$/],
                use: "raw-loader"
              },
              {
                test: /\.(gif|png|mp3|jpe?g|svg|xml)$/i,
                use: {
                  loader: "file-loader",
                  options: {
                    name: "[name].[ext]",
                    outputPath: "src/sprites",
                    publicPath: "src/sprites"
                  }
                }
              }, {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
              },
              {
                test: /\.ttf$/,
                use: [
                  {
                    loader: 'ttf-loader',
                    options: {
                      name: './fonts/[hash].[ext]',
                    },
                  }
                ]
              }
                   
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                }
            })
        ]
    },
    resolve: {
        extensions: [".*",".js",".jsx",".ts",".tsx", ".env"],
      },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            "typeof CANVAS_RENDERER": JSON.stringify(true),
            "typeof WEBGL_RENDERER": JSON.stringify(true),
            "typeof WEBGL_DEBUG": JSON.stringify(false),
            // "typeof EXPERIMENTAL": JSON.stringify(false),
            // "typeof PLUGIN_3D": JSON.stringify(false),
            // "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
            "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
            "typeof FEATURE_SOUND": JSON.stringify(true)
        }),
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public/src/sprites', to: 'src/sprites' },
                { from: 'public/src/sounds', to: 'src/sounds' },
                { from: 'public/src/fonts', to: 'src/fonts' },
                { from: 'public/favicon.png', to: 'favicon.png' },
                { from: 'public/style.css', to: 'style.css' }
            ],
        }),
        new webpack.DefinePlugin({
          IS_DEV: JSON.stringify(false),
        }),
    ]
};

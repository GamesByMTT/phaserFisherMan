const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const isDev = process.argv.includes('webpack-dev-server') || process.argv.includes('serve');
module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  entry: "./src/scripts/index.ts",
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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
        test: /\.(ttf|woff|woff2|eot)$/, // Rule for font files
        use: {
          loader: 'file-loader',
          options: {
            name: 'public/src/fonts/CrashLandingBB_ital.ttf', // Output fonts in a folder
          },
        },
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
  resolve: {
    extensions: [".*",".js",".jsx",".ts",".tsx", ".env"],
    alias:{
      assets: path.join(__dirname, 'src/sprites')
    },
    
    
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.join(__dirname, "dist/**/*")]
  }),
  
  new webpack.DefinePlugin({
    "typeof CANVAS_RENDERER": JSON.stringify(true),
    "typeof WEBGL_RENDERER": JSON.stringify(true),
    "typeof WEBGL_DEBUG": JSON.stringify(true),
    // "typeof EXPERIMENTAL": JSON.stringify(true),
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
  IS_DEV: JSON.stringify(true),
}),
  ]
};

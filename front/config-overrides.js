const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "vm": require.resolve("vm-browserify"),
      "process": require.resolve("process/browser.js")
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        'process': 'process/browser.js'
      })
    );

    return config;
};
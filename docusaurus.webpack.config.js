// Webpack configuration for Docusaurus with Node.js polyfills
module.exports = function (context, options) {
  return {
    name: 'custom-webpack-config',
    configureWebpack(config, isServer) {
      if (!isServer) {
        // Add polyfills for Node.js modules in browser
        config.resolve = {
          ...config.resolve,
          fallback: {
            ...config.resolve?.fallback,
            fs: false, // File system operations will be handled via API
            path: require.resolve('path-browserify'),
            crypto: require.resolve('crypto-browserify'),
            buffer: require.resolve('buffer/'),
            stream: require.resolve('stream-browserify'),
            util: require.resolve('util/'),
            process: require.resolve('process/browser'),
          },
        };

        // Provide global Buffer
        config.plugins.push(
          new (require('webpack').ProvidePlugin)({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          })
        );
      }
      return config;
    },
  };
};
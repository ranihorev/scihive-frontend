const { override, addWebpackPlugin } = require('customize-cra');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: override(
    // usual webpack plugin
    addWebpackPlugin(new BundleAnalyzerPlugin()),
  ),
};

const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = function override(config, env) {
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const plugins = [...config.plugins];
  if (authToken) {
    const sentryPlugin = new SentryWebpackPlugin({
      // sentry-cli configuration
      authToken,
      org: 'scihive',
      project: 'react-frontend',

      // webpack specific configuration
      include: '.',
      ignore: ['node_modules', 'webpack.config.js', 'postcss.config.js', 'config-overrides.js', 'tailwind.config.js'],
    });
    plugins.push(sentryPlugin);
  } else {
    console.warn('Sentry auth token is missing. Skipping!');
  }
  return { ...config, plugins };
};

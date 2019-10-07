module.exports = function override(config) {
  config.module.rules[0].parser.requireEnsure = true;
  return config;
};

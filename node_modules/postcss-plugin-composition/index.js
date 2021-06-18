var postcss = require('postcss');

module.exports = postcss.plugin('postcss-plugin-composition', function(plugins) {
  if(!Array.isArray(plugins)) {
    throw new Error('`options` for postcss-plugin-composition must be array of plugins');
  }

  return function (root, result) {
    return postcss(plugins)
      .process(root, result.opts)
  };
});

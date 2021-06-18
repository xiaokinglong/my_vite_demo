# PostCSS Plugin Composition [![Build Status][ci-img]][ci]

[PostCSS] plugin which holds other PostCSS plugins.

[PostCSS]: https://github.com/postcss/postcss

## Usage

```js

const composition = require('postcss-plugin-composition');
postcss([
  composition([
    require('postcss-simple-vars')
    require('postcss-modules')
  ]),

  require('postcss-autoreset')
])
```

This module has very specific use-case. If you apply all plugins as is with `postcss-modules`.
You will see at the end your css repeated, because `postcss-modules` executes all modules
for you.

That is why need to create composition of plugins that should be applied to each file.
And to the end add plugins which whill be applied to result.

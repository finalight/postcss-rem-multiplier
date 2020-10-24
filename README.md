# postcss-rem-to-pixel [![NPM version](https://badge.fury.io/js/postcss-rem-to-pixel.svg)](http://badge.fury.io/js/postcss-rem-to-pixel)

A plugin for [PostCSS](https://github.com/ai/postcss) that multiplies rem units by a certain factor.

## Install

```shell
$ npm install postcss-rem-multiplier --save-dev
```

## Usage

There are cases that you need to embed your own widget with your own css into an application. However, all of your css which contains rem value which is based on a base-font-size that is different from the one given in the application’s css.

With this plugin, it will multiply your rem by a certain factor so as to match the resultant font size correctly.

The default multiplier is 1, which basically doesn't multiply anything

### Input/Output

_With the default settings, only font related properties are targeted._

```css
// input
h1 {
    margin: 0 0 20px;
    font-size: 2rem;
    line-height: 1.2;
    letter-spacing: 0.0625rem;
}

// output
h1 {
    margin: 0 0 20px;
    font-size: 32px;
    line-height: 1.2;
    letter-spacing: 1px;
}
```

### Example

```js
var fs = require("fs");
var postcss = require("postcss");
var remToPx = require("postcss-rem-to-pixel");
var css = fs.readFileSync("main.css", "utf8");
var options = {
    replace: false,
};
var processedCss = postcss(remToPx(options)).process(css).css;

fs.writeFile("main-px.css", processedCss, function (err) {
    if (err) {
        throw err;
    }
    console.log("Rem file written.");
});
```

### options

Type: `Object | Null`  
Default:

```js
{
    unitPrecision: 5,
    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    selectorBlackList: [],
    mediaQuery: false,
}
```

-   `unitPrecision` (Number) The decimal precision px units are allowed to use, floored (rounding down on half).
-   `propList` (Array) The properties that can change from rem to px.
    -   Values need to be exact matches.
    -   Use wildcard `*` to enable all properties. Example: `['*']`
    -   Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
    -   Use `!` to not match a property. Example: `['*', '!letter-spacing']`
    -   Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']`
-   `selectorBlackList` (Array) The selectors to ignore and leave as rem.
    -   If value is string, it checks to see if selector contains the string.
        -   `['body']` will match `.body-class`
    -   If value is regexp, it checks to see if the selector matches the regexp.
        -   `[/^body$/]` will match `body` but not `.body`
-   `mediaQuery` (Boolean) Allow rem to be converted in media queries.

### Use with gulp-postcss and autoprefixer

```js
var gulp = require("gulp");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var remToPx = require("postcss-rem-to-pixel");

gulp.task("css", function () {
    var processors = [
        autoprefixer({
            browsers: "last 1 version",
        }),
        remToPx({
            replace: false,
        }),
    ];

    return gulp
        .src(["build/css/**/*.css"])
        .pipe(postcss(processors))
        .pipe(gulp.dest("build/css"));
});
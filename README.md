# ES6 Boilerplate
## Transpiled into ES5

# Installation
## Prerequisites
* `node.js`
* `gulp` installed globally (`npm install -g gulp`)

## Downloading with `git` and intalling with `npm`
* `mkdir es6-boilerplate`
* `cd es6-boilerplate`
* `git clone https://github.com/levanroinishvili/ES6-Boilerplate .`
* `npm install`
* `gulp` or `gulp build:serve:watch` (see *Gulp Tasks* below)

## Gulp Tasks
The boilerplate comes with certain `gulp` tasks defined. The tasks may
uneedupdating or modifying as the project grows.
There are [Development Tasks](#development-tasks) and [Production Tasks](#production-tasks)

### Development Tasks
In some cases it may be better to use the [Production Tasks](#production-tasks) even during development.
The reason is that Production Tasks and Development tasks treat JavaScript files differently, and some code
will respond differently to these treatments.
See [Differences Between Development and Production Behavior](#differences-between-development-and-production-behavior)

* `gulp` the default task will transpile ES6 JavaScript and SASS (see below for details), will
load `src/index.html` into the browser and watch for changes to entire `src` folder
* `gulp transpile` will transpile the following files:
  * `ES6 JavaScript` from folder `src/js-es6` to `src/js`
  * `Sass` from folder `src/sass` (use extension `.scss`) to `src/css`
* `gulp serve` will ttranspile (as above) and open in the browser


### Production Tasks
* `gulp build` will build the application in the `/dist` folder
* `gulp build:serve` will build and open the project in the browser (`index.html`)
* `gulp build:serve:watch` will build, open and watch source changes
  * As of yet, this will not watch changes directly to:
    * `dist` folder
    * `src/js` folder
      * Watches `src/js-es6` instead
    * `src/css`
      * Watches `src/sass` instead


### Differences Between Development and Production Behavior
In this implementation, the Development Tasks will not bundle javascript modules into a single file and the
JavaScript files will be loaded asynchronously via SystemJS module loader. On the contrary, the Development
Tasks *will* bundle modules and they will be included with `<script>` tag in the `<head>`,
and will be processed synchronously before the page body loads and DOM is constructed.

These differnt treatment will result in differences in behavior. Consider two snippets:

**Snippet 1**
```JavaScript
let x = document.getElementById('theId');
```

**Snippet 2**
```JavaScript
window.onload = function() {
  let x = document.getElementById('theId');
};
```

For **Development Tasks**, **Snippet 1** will most likely assign a DOM object to `x`,
as the JavaScript will be loaded asyncronously and the DOM object is likely to be constructed.
However, **Snippet 2** may do nothing, as the load event is likeyly to have already passed.

For **Production Tasks**, **Snippet 1** will always assign `null` to `x`, as the DOM is not yet constructed.
**Snippet 2** will always work correctly.
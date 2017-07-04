SystemJS.config({
	paths: {
	      // paths serve as alias
	      'npm:': 'node_modules/'
	    },
	map: {
      'rxjs': 'npm:rxjs'
    },
    packages: {
      rxjs: {
        defaultExtension: 'js'
      },
      js: {
        defaultExtension: 'js'
      }
    }
});
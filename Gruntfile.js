"use strict";

var fs = require('fs')
  , path = require('path')
  , regenerator = require('regenerator');

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['*.js', 'lib/*.js', 'test/*.js']
      , options: {
        laxcomma: true
        , esnext: true
        , trailing: true
        , node: true
        , strict: true
      }
    }
    , mochaTest: {
      unit: ['test/*.js']
    }
    , mochaTestConfig: {
      options: {
        timeout: 60000,
        reporter: 'spec'
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('unit', 'mochaTest:unit');
  grunt.registerTask('test', ['unit']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('travis', ['unit']);
  grunt.registerTask('build', function() {
    var thisDir = path.resolve(__dirname, "lib");
    console.log("Getting es6 source");
    var source6 = fs.readFileSync(path.resolve(thisDir, "yiewd.js"), {
      encoding: 'utf8'
    });
    console.log("Generating es5 source");
    var es5Source = regenerator(source6);
    console.log("Writing es5 source");
    fs.writeFileSync(path.resolve(thisDir, "yiewd-es5.js"), es5Source);
  });
};

"use strict";

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
  grunt.registerTask('default', ['test']);
  grunt.registerTask('travis', ['unit']);
};

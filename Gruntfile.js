module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
      jshint: {
        src: ['src/**/*.js'],
        options: {
          jshintrc: "./.jshintrc"
        }
      },
      watch: {
        files: ['src/**/*.js',],
        tasks: ['jshint']
      },
      mocha: {
        test: {
          src: ['tests/**/*.html'],
          options: {
            run: true,
          },
        },
      },
      componentbuild: {
        options: {
          src: 'index.css',
          dest: './build/',
          name: 'study_vue',
          verbose: true
        }
      }
  });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-mocha' );
    grunt.loadNpmTasks('grunt-component-build');
    // 默认被执行的任务列表。
    grunt.registerTask('test',['mocha']);
    grunt.registerTask('default',['jshint','mocha','componentbuild']);
  };
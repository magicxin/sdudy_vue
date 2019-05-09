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
        tasks: ['jshint','browserify']
      },
      mocha: {
        test: {
          src: ['tests/**/*.html'],
          options: {
            run: true,
          },
        },
      },
      browserify: {
        build: {
          src: ['src/main.js'],
          dest: 'build/bundle.js',
          options: {
            browserifyOptions: {
              standalone: 'Seed'
            }
          }
        }
      }
  });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-mocha' );
    grunt.loadNpmTasks('grunt-browserify');
    // 默认被执行的任务列表。
    grunt.registerTask('test',['mocha']);
    grunt.registerTask('default',['jshint','mocha','browserify']);
  };
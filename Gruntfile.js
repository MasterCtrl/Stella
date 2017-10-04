module.exports = function(grunt) {
    
    grunt.loadNpmTasks('grunt-screeps');
    private = require('./private.json')

    grunt.initConfig({
        screeps: {
            options: {
                email: private.email,
                password: private.password,
                branch: private.branch,
                ptr: private.ptr
            },
            dist: {
                src: ['dist/*.js']
            }
        }
    });
}
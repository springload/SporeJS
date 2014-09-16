module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';\n'
            },

            app: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/velocity/jquery.velocity.min.js',
                    'bower_components/underscore/underscore.js',
                    'bower_components/nunjucks/browser/nunjucks-slim.min.js',
                    'bower_components/backbone/backbone.js',
                    'bower_components/marionette/lib/backbone.marionette.min.js',
                    'bower_components/backbone.stickit/backbone.stickit.js',
                    'bower_components/nouislider/jquery.nouislider.min.js',
                    'build/admin_templates.js',
                    'build/admin.js'
                ],
                dest: 'public/js/admin.js'
            },
            panel_css: {
                src: [
                    'bower_components/nouislider/jquery.nouislider.css'
                ],
                dest: "public/css/experts.css"
            }
        },

        nunjucks: {
            admin: {
                baseDir: 'frontend/admin/views/',
                src: 'frontend/admin/views/**/*.j2',
                dest: 'build/admin_templates.js',
                options: {
                    name: function(filename) {
                        return filename.replace(/\.j2$/, "");
                    }
                }
            }
        },

        browserify: {
            admin: {
                files: {
                    'build/admin.js': [
                        'frontend/admin/models/**/*.js',
                        'frontend/admin/controllers/**/*.js',
                        'frontend/admin/admin.js'
                    ]
                }
            },
            site: {
                files: {
                    'public/js/site.js': [
                        'frontend/common/components/**/*.js',
                        'frontend/common/site.js'
                    ]
                }
            }
        },

        watch: {
            js: {
                options: {
                    nospawn: true,
                    livereload: true
                },
                files: [
                    "frontend/**/*.js",
                    "frontend/**/views/*.j2",
                ],
                tasks: [
                    "js"
                ]
            },
            sass: {
                options: {
                    nospawn: true,
                    livereload: true
                },
                files: [
                    "frontend/styles/**/*.scss"
                ],
                tasks: [
                    "sass"
                ]
            }
        },

        clean: {
            js: "build"
        },

        sass: {
            dev: {
                files: {
                    "public/css/site.css": "frontend/styles/site.scss",
                    "public/css/marketing.css": "frontend/styles/marketing.scss",
                    "public/css/statistics.css": "frontend/styles/statistics.scss",
                    "public/css/admin.css": "frontend/styles/admin.scss"
                },
                options: {
                    // sourceComments: 'map'
                }
            }
        },

        nodemon: {
            dev: {
                script: 'spore.js',
                options: {
                    nodeArgs: ['--harmony'],
                    cwd: __dirname,
                    ignore: [
                        'node_modules/**',
                        'bower_components/**'
                    ],
                    ext: 'js, json'
                }
            }
        }

    });

    /**
     * The cool way to load your grunt tasks
     * --------------------------------------------------------------------
     */
    Object.keys( pkg.devDependencies ).forEach( function( dep ){
        if( dep.substring( 0, 6 ) === 'grunt-' ) grunt.loadNpmTasks( dep );
    });

    grunt.registerTask("default", [
        "nodemon"
    ]);

    grunt.registerTask("js", [
        "browserify",
        "nunjucks",
        "concat",
        "clean:js"
    ]);

    grunt.registerTask("build", [
        "js",
        "sass"
    ]);

};
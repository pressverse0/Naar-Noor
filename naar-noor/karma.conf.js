// Karma configuration file for Jasmine tests without full Angular CLI
// Uses a simpler approach focused on test file compilation

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
    ],
    files: [
      // Include polyfills and test setup first
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/zone-testing.js',
      // Then test files - spec files only
      { pattern: './src/**/*.spec.ts', type: 'js' },
      // Source files for coverage
      { pattern: './src/**/*.ts', type: 'js', watched: false, included: false, served: true }
    ],
    exclude: [
      './src/main.ts',
      './src/environments/**',
      './cypress/**'
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: false,
        seed: 42
      }
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer'
        ]
      }
    }
  });
};

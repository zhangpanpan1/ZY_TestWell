seajs.config({
  // Enable plugins
  plugins: ['shim'],

  // Configure alias
  alias: {
    'jquery': {
      src: 'lib/jquery-1.8.2.min.js',
      exports: 'jQuery'
    },

    'jquery.contextMenu': {
      src: 'lib/jQcontextMenu/jquery.contextMenu.js',
      deps: ['jquery']
    },

    'XY_Dialog': {
      src: 'lib/XY_Dialog/XY_Base.js',
      deps: ['jquery']
    },

    'colorpicker': {
      src: 'lib/colorpicker/jquery.colorPicker.js',
      deps: ['jquery']
    }
  }
});
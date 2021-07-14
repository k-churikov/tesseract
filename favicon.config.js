const stringHash = require('string-hash')('foo');
const PATHS = require('./paths.config.json');
let FAVICON_DATA_FILE = 'faviconData.json';

module.exports = {
  masterPicture: PATHS.favicon.master,
  dest: PATHS.root,
  iconsPath: '/',
  design: {
    ios: {
      pictureAspect: 'backgroundAndMargin',
      backgroundColor: '#ffffff',
      margin: '14%',
      assets: {
        ios6AndPriorIcons: false,
        ios7AndLaterIcons: false,
        precomposedIcons: false,
        declareOnlyDefaultIcon: true
      }
    },
    appName: 'My App',
    desktopBrowser: {
      design: 'raw'
    },
    windows: {
      pictureAspect: 'noChange',
      backgroundColor: '#ffc40d',
      onConflict: 'override',
      assets: {
        windows80Ie10Tile: false,
        windows10Ie11EdgeTiles: {
          small: false,
          medium: true,
          big: false,
          rectangle: false
        }
      },
      appName: 'My App'
    },
    androidChrome: {
      pictureAspect: 'noChange',
      themeColor: '#ffffff',
      manifest: {
        name: 'My App',
        display: 'standalone',
        orientation: 'notSet',
        onConflict: 'override',
        declared: true
      },
      assets: {
        legacyIcon: false,
        lowResolutionIcons: false
      }
    },
    safariPinnedTab: {
      pictureAspect: 'blackAndWhite',
      threshold: 50,
      themeColor: '#223a40'
    }
  },
  settings: {
    compression: 1,
    scalingAlgorithm: 'Mitchell',
    errorOnImageTooSmall: false,
    readmeFile: false,
    htmlCodeFile: false,
    usePathAsIs: false
  },
  versioning: {
    paramName: 'v',
    paramValue: stringHash
  },
  markupFile: FAVICON_DATA_FILE
};
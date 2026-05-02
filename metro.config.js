const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: path.resolve(__dirname, 'src/styles/global.css'),
  designSystem: {
    colors: {
      primary: '#1A3A5C',
      secondary: '#2E6DA4',
      error: '#E74C3C',
    },
  },
});
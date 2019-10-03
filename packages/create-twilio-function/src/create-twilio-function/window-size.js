const windowSize = require('window-size');

function getWindowSize() {
  const defaultSize = { width: 80, height: 300 };
  let currentSize = windowSize.get();

  if (!currentSize) {
    return defaultSize;
  }
  else {
    if(!currentSize.width) currentSize.width = defaultSize.width;
    if(!currentSize.height) currentSize.height = defaultSize.height;
    return currentSize;
  }
}

module.exports = getWindowSize;
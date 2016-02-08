'use strict';

var HypothesisChromeExtension = require('./hypothesis-chrome-extension');

var browserExtension = new HypothesisChromeExtension({
  chromeTabs: chrome.tabs,
  chromeBrowserAction: chrome.browserAction,
  extensionURL: function (path) {
    return chrome.extension.getURL(path);
  },
  isAllowedFileSchemeAccess: function (fn) {
    return chrome.extension.isAllowedFileSchemeAccess(fn);
  },
});

browserExtension.listen(window);
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.requestUpdateCheck(function (status) {
  chrome.runtime.onUpdateAvailable.addListener(onUpdateAvailable);
});

chrome.runtime.onMessage.addListener(function (message, sender, response) {
  switch (message.type) {
    case 'SIDEBAR_SESSION_STATE_CHANGED':
      // TODO - Refresh badge counts for tabs if the user account changed
      // TODO - Set Raven.js user ID context using this info
      console.log('Received sidebar session state', message.state);
      var stateJSON = JSON.stringify(message.state);
      window.localStorage.setItem('sessionState', stateJSON);
      break;
    default:
      break;
  }
});

function onInstalled(installDetails) {
  if (installDetails.reason === 'install') {
    browserExtension.firstRun(installDetails);
  }

  // We need this so that 3rd party cookie blocking does not kill us.
  // See https://github.com/hypothesis/h/issues/634 for more info.
  // This is intended to be a temporary fix only.
  var details = {
    primaryPattern: 'https://hypothes.is/*',
    setting: 'allow'
  };
  chrome.contentSettings.cookies.set(details);
  chrome.contentSettings.images.set(details);
  chrome.contentSettings.javascript.set(details);

  browserExtension.install();
}

function onUpdateAvailable() {
  chrome.runtime.reload();
}

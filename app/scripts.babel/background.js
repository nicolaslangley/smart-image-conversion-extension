'use strict';

chrome.runtime.onInstalled.addListener(function(details) {
  console.log('previousVersion', details.previousVersion);
});


console.log('Event Page for Browser Action');
var badgeCount = 0;
chrome.browserAction.setBadgeText({text: badgeCount.toString()});
chrome.runtime.onMessage.addListener(function (msg, sender) {
  if ((msg.from === 'content') && (msg.subject === 'incrementBadge')) {
    badgeCount += 1;
    chrome.browserAction.setBadgeText({text: badgeCount.toString()});
  }
  else if ((msg.from === 'content') && (msg.subject === 'resetBadge')) {
    badgeCount = 0;
    chrome.browserAction.setBadgeText({text: badgeCount.toString()});
  }
});




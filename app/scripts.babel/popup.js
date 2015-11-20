'use strict';

$('#optionsButton').on('click', function() {
  var optionsUrl = chrome.extension.getURL('options.html');
  chrome.tabs.query({url: optionsUrl}, function(tabs) {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, {active: true});
    } else {
      chrome.tabs.create({url: optionsUrl});
    }
  });
});

chrome.storage.sync.get({
  outputFormat: 'jpeg', // This is the default
}, function(items) {
  $('#currentFormatText').text('Converting to ' + items.outputFormat);
});

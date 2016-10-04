document.addEventListener('DOMContentLoaded', function() {
  var clearDataBtn = $('#clear-data');
  clearDataBtn.on('click', function() {
    chrome.storage.local.clear();
  });
});
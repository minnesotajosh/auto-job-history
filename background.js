// This is a service worker for background tasks
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
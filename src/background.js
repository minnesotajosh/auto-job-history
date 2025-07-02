// src/background.js

// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('Auto Job History extension installed!');
  });
  
  // Listen for messages from popup or content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPLOAD_RESUME') {
      // Placeholder: handle resume upload logic here
      console.log('Received resume upload:', message.data);
      sendResponse({ status: 'success' });
    }
    // You can add more message types as needed
  });
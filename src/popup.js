const resumeInput = document.getElementById('resumeInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const openFile = document.getElementById('openFile');
const removeFile = document.getElementById('removeFile');

// Helper to update UI based on file presence
function updateUI(hasFile, name = '') {
  if (hasFile) {
    resumeInput.style.display = 'none';
    fileInfo.style.display = 'block';
    fileName.textContent = name;
  } else {
    resumeInput.style.display = 'block';
    fileInfo.style.display = 'none';
    fileName.textContent = '';
    resumeInput.value = '';
  }
}

// Load file info on popup open
chrome.storage.local.get(['resumeFile'], (result) => {
  if (result.resumeFile) {
    updateUI(true, result.resumeFile.name);
    openFile.onclick = () => {
      const a = document.createElement('a');
      a.href = result.resumeFile.dataUrl;
      a.download = result.resumeFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    removeFile.onclick = () => {
      chrome.storage.local.remove('resumeFile', () => {
        updateUI(false);
      });
    };
  } else {
    updateUI(false);
  }
});

// Handle file upload
resumeInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    chrome.storage.local.set({
      resumeFile: {
        name: file.name,
        dataUrl: evt.target.result
      }
    }, () => {
      updateUI(true, file.name);
    });
  };
  reader.readAsDataURL(file);
});

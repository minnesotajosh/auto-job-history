document.getElementById('resumeUpload').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const content = reader.result;
    chrome.storage.local.set({ resumeRaw: content }, () => {
      document.getElementById('status').textContent = 'Resume uploaded successfully.';
    });
  };
  reader.readAsText(file);
});

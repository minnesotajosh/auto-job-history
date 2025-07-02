const resumeInput = document.getElementById('resumeInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const openFile = document.getElementById('openFile');
const removeFile = document.getElementById('removeFile');
const filePreview = document.getElementById('filePreview');

function clearUI() {
  resumeInput.style.display = 'block';
  fileInfo.style.display = 'none';
  fileName.textContent = '';
  filePreview.textContent = '';
  resumeInput.value = '';
}

function updateUI(hasFile, name = '', previewText = '') {
  if (hasFile) {
    resumeInput.style.display = 'none';
    fileInfo.style.display = 'block';
    fileName.textContent = name;
    filePreview.textContent = previewText;
  } else {
    clearUI();
  }
}

// Load file info on popup open
chrome.storage.local.get(['resumeFile'], (result) => {
  if (result.resumeFile) {
    const { name, dataUrl, previewText } = result.resumeFile;
    updateUI(true, name, previewText);

    openFile.onclick = () => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    removeFile.onclick = () => {
      chrome.storage.local.remove('resumeFile', () => {
        clearUI();
      });
    };
  } else {
    clearUI();
  }
});

// Handle file upload
resumeInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  clearUI();

  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'docx') {
    const reader = new FileReader();
    reader.onload = function(evt) {
      mammoth.extractRawText({ arrayBuffer: evt.target.result })
        .then(function(result) {
          console.log('Extracted DOCX text:', result.value);
          const dataUrlReader = new FileReader();
          dataUrlReader.onload = function(e2) {
            chrome.storage.local.set({
              resumeFile: {
                name: file.name,
                dataUrl: e2.target.result,
                previewText: result.value
              }
            }, () => {
              updateUI(true, file.name, result.value);
            });
          };
          dataUrlReader.readAsDataURL(file);
        });
    };
    reader.readAsArrayBuffer(file);

  } else if (ext === 'txt') {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const text = evt.target.result;
      console.log('Extracted TXT text:', text);
      const dataUrlReader = new FileReader();
      dataUrlReader.onload = function(e2) {
        chrome.storage.local.set({
          resumeFile: {
            name: file.name,
            dataUrl: e2.target.result,
            previewText: text
          }
        }, () => {
          updateUI(true, file.name, text);
        });
      };
      dataUrlReader.readAsDataURL(file);
    };
    reader.readAsText(file);

  } else if (ext === 'pdf') {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const typedarray = new Uint8Array(evt.target.result);
      pdfjsLib.getDocument({ data: typedarray }).promise.then(function(pdf) {
        let maxPages = pdf.numPages;
        let countPromises = [];
        for (let j = 1; j <= maxPages; j++) {
          countPromises.push(
            pdf.getPage(j).then(function(page) {
              return page.getTextContent().then(function(textContent) {
                return textContent.items.map(item => item.str).join(' ');
              });
            })
          );
        }
        Promise.all(countPromises).then(function(texts) {
          const fullText = texts.join('\n');
          console.log('Extracted PDF text:', fullText);
          const dataUrlReader = new FileReader();
          dataUrlReader.onload = function(e2) {
            chrome.storage.local.set({
              resumeFile: {
                name: file.name,
                dataUrl: e2.target.result,
                previewText: fullText
              }
            }, () => {
              updateUI(true, file.name, fullText);
            });
          };
          dataUrlReader.readAsDataURL(file);
        });
      });
    };
    reader.readAsArrayBuffer(file);

  } else if (ext === 'doc') {
    // DOC extraction in-browser is not robust. You can store the file and log a message.
    const reader = new FileReader();
    reader.onload = function(evt) {
      console.log('DOC file uploaded. Text extraction is not supported in-browser.');
      const dataUrl = evt.target.result;
      chrome.storage.local.set({
        resumeFile: {
          name: file.name,
          dataUrl: dataUrl,
          previewText: '[Preview not available for .doc files]'
        }
      }, () => {
        updateUI(true, file.name, '[Preview not available for .doc files]');
      });
    };
    reader.readAsDataURL(file);

  } else {
    alert('Only PDF, DOCX, DOC, and TXT files are supported.');
    clearUI();
  }
});
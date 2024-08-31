document.getElementById('encryptButton').addEventListener('click', () => {
  browser.runtime.sendMessage({ action: 'encrypt' });
});

document.getElementById('decryptButton').addEventListener('click', () => {
  console.log('User pressed decryptButton'); //DEBUG
  const fileInput = document.getElementById('fileInput');
  console.log('file', fileInput); //DEBUG
  const file = fileInput.files[0];
  
  if (file) {
    const reader = new FileReader();
    console.log('Trying to read file'); //DEBUG
    reader.onload = function(event) {
      const fileContent = event.target.result;
      browser.runtime.sendMessage({ action: 'decrypt', fileContent });
    };
    reader.readAsText(file);
  } else {
    alert('Please select a file.');
  }
});


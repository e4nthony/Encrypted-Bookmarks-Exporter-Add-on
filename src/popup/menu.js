//---Listeners of main buttons at main window.---

document.getElementById('encryptButton').addEventListener('click', () => {
  const passInput_enc = document.getElementById('passwordInput_enc').value;
  if (!passInput_enc) {
    alert('Please provide a password.');
    return;
  }
  browser.runtime.sendMessage({ action: 'encrypt', passInput_enc });
});

document.getElementById('decryptButton').addEventListener('click', () => {
  console.log('User pressed decryptButton'); //DEBUG

  const fileInput = document.getElementById('fileInput');
  console.log('fileInput', fileInput); //DEBUG

  const passInput_dec = document.getElementById('passwordInput_dec').value;
  if (!passInput_dec) {
    alert('Please provide a password.');
    return;
  }
  
  const file = fileInput.files[0]; //file is nested in fileInput 
  console.log('fileInput.files[0]: ', fileInput.files[0]); //DEBUG

  if (file) {
    const reader = new FileReader();
    console.log('Trying to read file'); //DEBUG
    
    reader.onload = function(event) {
      const fileContent = event.target.result;
      
      if (!(fileContent instanceof Uint8Array)) {
        console.log('fileContent NOT instanceof Uint8Array'); //DEBUG
      }
      console.log('fileContent: ', fileContent)

      content_uint8Array = new Uint8Array(fileContent)

      if (!(content_uint8Array instanceof Uint8Array)) {
        console.log('content_uint8Array NOT instanceof Uint8Array'); //DEBUG
      }
      console.log('content_uint8Array: ', content_uint8Array)

      browser.runtime.sendMessage({ action: 'decrypt', fileContent: content_uint8Array, passInput_dec });
    };

    reader.readAsArrayBuffer(file);

  } else {
    alert('Please select a file.');
  }
});

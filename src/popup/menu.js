//---Listeners of main buttons at main window.---

document.getElementById('encryptButton').addEventListener('click', () => {
  const passInput_enc = document.getElementById('passwordInput_enc');
  browser.runtime.sendMessage({ action: 'encrypt', passInput_enc });
});

document.getElementById('decryptButton').addEventListener('click', () => {
  console.log('User pressed decryptButton'); //DEBUG

  const fileInput = document.getElementById('fileInput');
  console.log('file', fileInput); //DEBUG

  const passInput_dec = document.getElementById('passwordInput_dec');

  const file = fileInput.files[0]; //file is nested in fileInput 
  
  if (file) {
    const reader = new FileReader();
    console.log('Trying to read file'); //DEBUG

    reader.onload = function(event) {
      const fileContent = event.target.result;
      browser.runtime.sendMessage({ action: 'decrypt', fileContent, passInput_dec });
    };

    reader.readAsText(file);

  } else {
    alert('Please select a file.');
  }
});

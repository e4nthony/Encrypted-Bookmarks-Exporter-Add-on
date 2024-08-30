document.getElementById('encryptBtn').addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'encrypt' });
});
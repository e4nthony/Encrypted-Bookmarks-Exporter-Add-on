
/* ------- GLOBAL VARIABLES ------- */
const SALT_LENGTH = 16
const IV_LENGTH = 12

const DEBUGGING_MODE = false; /* DEBUGGING MODE TOGGLE - enables logging into console */


/**
 * logs any arguments as is.
 * (inside of this file*)
 */
function tolog(...arguments) {
  if (DEBUGGING_MODE){
    console.log(...arguments);
  }
}


/**
 * Code bellow will generate html in Netscape-Bookmarks format. 
 * Generator made by reverse engineering.
 */
async function generateNetscapeHTML() {
  tolog('entered generateNetscapeHTML()'); //DEBUG
  bookmarksTree = await browser.bookmarks.getTree()

  /* This is initialization of html file that will cointain bookmarks in netscape format, so browsers could read it and import using existing build in tools. */
  let html = `
  <!DOCTYPE NETSCAPE-Bookmark-file-1>\n<!-- This is an automatically generated file by Encrypted Bookmarks Exporter Add-on. Please do not edit. -->\n<META http-equiv="Content-Type" content="text/html; charset=UTF-8">\n<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; img-src data: *; object-src 'none'">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks Export</H1>\n<DL><p>\n`;
  

  /* Chrome requires indents ! */
  function makeIndent(indentLength) {
    return "\t".repeat(indentLength);
  }


  /**
   * function runs over all nodes in hierarchy of bookmarks.
   * this actually is promise that can be itself url or folder that contain children that can be url or folder etc..
   * 
   * @param {*} bookmarksTree - promise object with hierarchy of nested children
   * @param {*} indent - indicates level of tree
   */
  function processTree(bookmarksTree, indent) {
    
    // for every obj inside this promise 
    for (const promise of bookmarksTree) {
      
      if (promise.type == "folder") {
        
        html += `${makeIndent(indent)}<DT><H3>${promise.title || (indent == 1 ? "Imported Bookmarks" : "Untitled Folder" ) }</H3>\n${makeIndent(indent)}<DL><p>\n`;
        
        if (promise.children) {
          processTree(promise.children, indent + 1 );
        }
        
        html += `${makeIndent(indent)}</DL><p>\n`;
        
      } else if (promise.type == "bookmark") {
        
        html += `${makeIndent(indent)}<DT><A HREF="${promise.url}">${promise.title}</A>\n`;
        
      } 

    }

  }
  

  processTree(bookmarksTree, 1); // tree is promise that can be itself folder or url, or contain children that can be folder or url
  
  html += `</DL><p>`;  // end of html file
  
  tolog('generated HTML:'); //DEBUG
  tolog(html);              //DEBUG
  return html;
}


/**
 * This function is using standart downloading method to save data into file.
 * (works)
 * 
 * NOT IN USE
 * 
 * @param {*} filename 
 * @param {*} contentPromise 
 * 
 * usage ex: downloadWithAnchor('bookmarks-export.html', html_string);
 */
async function downloadWithAnchor(filename, contentPromise) {

  var content = await Promise.resolve(contentPromise);

  const blob = new Blob([content], { type: 'text/plain' });  // blob - Binary Large Object

  const link  = document.createElement('a'); // a - anchor
  link.href = URL.createObjectURL(blob); // prepare link
  link.download = filename;

  link.click(); // trigger the download
  
  URL.revokeObjectURL(link.href); // utilize url
}


/**
 * This function is using build-in browser API to download data into file. [preferable]
 * (works)
 * 
 * @param {*} filename 
 * @param {*} contentPromise 
 */
async function downloadWithBrowserAPI(filename, contentPromise) {
  
  var content = await Promise.resolve(contentPromise);
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // works for both firefox and chrome
  browser.downloads.download({
    url: url,
    filename: filename,
    saveAs: true 
  });
  
  setTimeout(() => URL.revokeObjectURL(url), 100000); // utilize url
}


/**
 * right now func have parsed text file that was at format NETSCAPE-Bookmark , (now document)
 *  
 * we know each bookmark or folder have tag '<DT>' right before it.
 * like 
 *    <DT><A HREF="">Bookmark_Name</A>
 * or 
 *    <DT><H3>Folder_Name</H3>
 *
 * 
 * ---NODES meaning---
 * '<DL>' - Definition List
 * '<DT>' - Definition Term
 * '<H3>' - Header
 * '<A>'- Anchor
 * 
 * 
 * Therefore, next tag following '<DT>' tag  may be '<a>...<a/>' or '<H3>...</H3>' only.
 * tag '<a>' means  Link - single bookmark.
 * tag '<H3>' means  Folder.
 * 
 * The func will use this it to send bookmarks creation requests to browser one by one,
 * getting assigned by browser id to the element we added right now, 
 * to use it for folder's sub nodes, for them we need the id assigned by browser (can't use made up ids)
 * 
 * @param {*} doc
 */
async function extractBookmarksFromHTMLandImport(document) {
  // let currentFolder = { folder_id: 'root', title: 'root' }; 
  // let foldersStack = [currentFolder];
  let foldersStack = [];

  const rootFolder = await browser.bookmarks.create({
    title: "Imported Bookmarks"
  });

  foldersStack.push(rootFolder);

  /**
   * The func processes a single HTML node.
   * 
   * Checks if it folder or link.
   * 
   * and adds node to the children list of the currentFolder
   * 
   * @param {*} node - The HTML node / '<DT>'......
   * @returns 
   */
  async function process_HTML_node(node) {
    tolog('entered process_HTML_node. node:', node); //DEBUG
    
    if (node.nodeName === 'DT') {
      const folder = node.querySelector('h3');
      tolog('node.querySelector(\'h3\') folder: ', folder); //DEBUG
      
      const link = node.querySelector('a');
      tolog('node.querySelector(\'a\') link: ', link); //DEBUG
      

      const last_element_in_stack = foldersStack.length - 1;
      const currentFolder  = foldersStack[last_element_in_stack];

      if (folder) {

        /**
         * newFolder - stores the folder created by browser (with newFolder's ID)
         */
        const newFolder = await browser.bookmarks.create({
          parentId: currentFolder.id,
          title: folder.textContent
        });
        tolog('folder 0 created: ', newFolder); //DEBUG

        // // add this newFolder we created to list of currentFolder children
        // currentFolder.children.push(newFolder);  

        // pushes newFolder into stack making total stack length increase by 1
        foldersStack.push(newFolder);

      } else if (link) {

        /**
         * creating bookmark using browser API (with newBookmark's ID)
         */
        await browser.bookmarks.create({
          parentId: currentFolder.id,
          title: link.textContent,
          url: link.href
        });

     } // end - if folder/link

    } // end - if DT
    

    // reverse the order to add items into browser in right order so order will be exactly as in html
    const childNodes_reversed_order = Array.from(node.childNodes).reverse();

    /**
     * example:
     * in hierarchy <DL><p> <DT><H3>...</H3> <DL><p>...</DL><p> </DL><p>
     * <DL>2 considered to be child of <DT>
     * 
     * Therefore, if we entered <DT> tag there is need to check children too.
     * need to run check on children in both cases (when node.nodeName === <DT> OR <DL>)
     */
    childNodes_reversed_order.forEach(async child => {
      await process_HTML_node(child); // will recursively process every child node of current node 
    });

  } // end - process_HTML_node
  

  // tolog('document :\n', document);                                   // DEBUG - html document
  tolog('document.body :\n', document.body);                         // DEBUG - <body>
  // tolog('document.body.children :\n', document.body.children);       // DEBUG - html collection
  // tolog('document.body.children[0] :\n', document.body.children[0]); // DEBUG - <h1>

  const global_DL = document.body.querySelector('dl'); // select the Definition List at root level
  process_HTML_node(global_DL); // call the func and actually process the root DL node
  
  tolog('extractBookmarksFromHTML finished. return :\n', foldersStack); //DEBUG
} // end - extractBookmarksFromHTML


async function handleFileExport(passInput_enc) {
  tolog('entered handleFileExport()'); //DEBUG

  html_string = await generateNetscapeHTML();

  encryptedData = await encryptHTMLFile(html_string, passInput_enc)
  
  /**
   * combines ciphertext with iv and salt
   * as iv and salt needed for decrypting, but not required to be kept secret.
   * therefore, the solution is to store them alongside with ciphertext to provide portability of encrypted file 
   */
  function combine(encryptedData){
    cipherLength = encryptedData.ciphertext.byteLength
    
    const combinedArray = new Uint8Array( cipherLength + IV_LENGTH + SALT_LENGTH);
    
    if (!(encryptedData.ciphertext instanceof Uint8Array)) {
      tolog('encryptedData.ciphertext NOT instanceof Uint8Array'); //DEBUG
    }
    if (!(encryptedData.iv instanceof Uint8Array)) {
      tolog('encryptedData.iv NOT instanceof Uint8Array'); //DEBUG
    }
    if (!(encryptedData.salt instanceof Uint8Array)) {
      tolog('encryptedData.salt NOT instanceof Uint8Array'); //DEBUG
    }


    combinedArray.set(new Uint8Array(encryptedData.ciphertext), 0);   // add ciphertext at beginning of file
    combinedArray.set(encryptedData.iv, cipherLength);                // add iv after ciphertext
    combinedArray.set(encryptedData.salt, cipherLength + IV_LENGTH);  // add salt at the end of file
  
    return combinedArray;
  }
  output = combine(encryptedData)

  downloadWithBrowserAPI('bookmarks-export.enc', output );

  console.log('Bookmarks exported successfully.'); // TAG: release
}


async function handleFileImport(content, passInput_dec) {
  tolog('entered handleFileImport()'); //DEBUG
  tolog('\t content: ', content); //DEBUG
  
  encrypted = new Uint8Array(content);

  if (!(content instanceof Uint8Array)) {
    tolog('content NOT instanceof Uint8Array'); //DEBUG
  }

  if (!(encrypted instanceof Uint8Array)) {
    tolog('content NOT instanceof Uint8Array'); //DEBUG
  }

  // const dec = new TextDecoder();
  // encrypted = dec.decode(encrypted)

  /**
   * separates ciphertext, iv and salt
   * and extracts them into separate variables 
   * 
   * note: ciphertext generated that way that it includes authentication tag inside it.
   */
  function separate(combinedArray){
    tolog('entered separate(combinedArray)'); //DEBUG
    tolog('\t combinedArray: ', combinedArray); //DEBUG

    console.log('\t combinedArray instanceof Uint8Array: ',combinedArray instanceof Uint8Array);

    cipherLength = combinedArray.byteLength - IV_LENGTH - SALT_LENGTH;
    tolog('\t cipherLength: ', cipherLength); //DEBUG
    

    let ciphertext = combinedArray.slice(0, cipherLength);
    let iv = combinedArray.slice(cipherLength, cipherLength + IV_LENGTH);
    let salt = combinedArray.slice(cipherLength + IV_LENGTH); //slices till the end of array


    tolog('\t ciphertext: ', ciphertext); //DEBUG
    tolog('\t iv: ', iv); //DEBUG
    tolog('\t salt: ', salt); //DEBUG

    ciphertext = new Uint8Array(ciphertext)
    iv = new Uint8Array(iv)
    salt = new Uint8Array(salt)

    tolog('\t ----after Uint8Array()------ '); //DEBUG
    tolog('\t ciphertext: ', ciphertext); //DEBUG
    tolog('\t iv: ', iv); //DEBUG
    tolog('\t salt: ', salt); //DEBUG

    return {ciphertext, iv, salt}
  }
  encryptedData = separate(encrypted)

  if (!(encryptedData.ciphertext instanceof Uint8Array)) {
    tolog('encryptedData.ciphertext NOT instanceof Uint8Array'); //DEBUG
  }
  if (!(passInput_dec instanceof Uint8Array)) {
    tolog('passInput_dec NOT instanceof Uint8Array'); //DEBUG
  }
  if (!(encryptedData.salt instanceof Uint8Array)) {
    tolog('encryptedData.salt NOT instanceof Uint8Array'); //DEBUG
  }
  if (!(encryptedData.iv instanceof Uint8Array)) {
    tolog('encryptedData.iv NOT instanceof Uint8Array'); //DEBUG
  }

  // tolog('passInput_dec:', passInput_dec); //DEBUG
  // pass_uint8Array = new Uint8Array(passInput_dec)
  // tolog('pass_uint8Array:', pass_uint8Array); //DEBUG

  tolog('passInput_dec:', passInput_dec); //DEBUG
  const enc = new TextEncoder();
  const passwordBytes = enc.encode(passInput_dec);
  tolog('passwordBytes:', passwordBytes); //DEBUG


  decryptedFile = await decryptHTMLFile(encryptedData.ciphertext, passwordBytes, encryptedData.salt, encryptedData.iv)

  tolog('decryptedFile:', decryptedFile); //DEBUG
  const decoder = new TextDecoder('utf-8');
  

  decodedDecryptedFile = decoder.decode(decryptedFile)
  tolog('decoder.decode(decryptedFile):', decodedDecryptedFile); //DEBUG


  // process the decrypted HTML to retrieve original bookmarks
  const parser = new DOMParser();
  const document = parser.parseFromString(decodedDecryptedFile, 'text/html');
  const bookmarks = await extractBookmarksFromHTMLandImport(document); 

  tolog('Bookmarks:', bookmarks); //DEBUG

  console.log('Bookmarks imported successfully.'); // TAG: release
}


//----------------------------- Encryption & Decryption --------------------------------------

/**
 * generates a cryptographic key (KeyMaterial) from a password  
 * 
 * uses the PBKDF2 algorithm to derive a PBKDF2_BaseKey from the password
 * 
 * @param {*} password 
 * @param {*} salt 
 * 
 * @returns - object that used as key for AES-GCM encryption and decryption. (its format according to documentation of AES-GCM)
 * 
 */
async function generateKeyFromPassword(password, salt) {
  tolog('entered generateKeyFromPassword()'); //DEBUG
  tolog('password: ', password); //DEBUG
  tolog('salt: ', salt); //DEBUG
  
  const enc = new TextEncoder();
  const rawKey = enc.encode(password); //password bytes

  /**
   * importKey(...) returns a CryptoKey object
   * 
   * object for use in PBKDF2 key derivation 
   * need to convert the password into a CryptoKey object so it can be processed in PBKDF2 key derivation.
   */
  const PBKDF2_BaseKey = await crypto.subtle.importKey(
    "raw",              // format
    rawKey,             // keyData - encoded password bytes
    { name: "PBKDF2" }, // algorithm
    false,              // extractable - "A boolean value indicating whether it will be possible to export the key using SubtleCrypto.exportKey() or SubtleCrypto.wrapKey()."
    ["deriveKey"]       // keyUsages - "An Array indicating what can be done with the key. "
  );

  /**
   * "The deriveKey() method of the SubtleCrypto interface can be used to derive a secret key from a master key."
   */
  return crypto.subtle.deriveKey(
    {// PBKDF2Params
      name: "PBKDF2",
      hash: "SHA-256",  // "A string representing the digest algorithm to use ." for PBKDF2.
      salt: salt,       // "This should be a random or pseudo-random value of at least 16 bytes. Unlike the input key material passed into deriveKey(), salt does not need to be kept secret." needed to ensure that the derived key is unique.
      iterations: 100000  // "the number of times the hash function will be executed"
    },
    
    PBKDF2_BaseKey,   // baseKey - "A CryptoKey representing the input to the derivation algorithm."
    
    { // AesKeyGenParams object
      name: "AES-GCM",
      length: 256   // "the length in bits of the key to generate"
    }, 
    
    false,  // extractable
    
    ["encrypt", "decrypt"]  // keyUsages
  );
}


async function encryptHTMLFile(htmlContent, password) {
  tolog('entered encryptHTMLFile()'); //DEBUG
  const enc = new TextEncoder();



  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));  // 128-bit salt
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));    // Initialization Vector for AES-GCM (12-byte iv is optimal choice)
  

  if (!(htmlContent instanceof Uint8Array)) {
    tolog('htmlContent NOT instanceof Uint8Array'); //DEBUG
  }
  if (!(password instanceof Uint8Array)) {
    tolog('password NOT instanceof Uint8Array'); //DEBUG
  }
  if (!(salt instanceof Uint8Array)) {
    tolog('salt NOT instanceof Uint8Array'); //DEBUG
  }
  if (!(iv instanceof Uint8Array)) {
    tolog('iv NOT instanceof Uint8Array'); //DEBUG
  }



  const key = await generateKeyFromPassword(enc.encode(password), salt);  // result of deriveKey()
  tolog('key: ', key); //DEBUG

  /**
   * encrypt(...) - "It takes as its arguments a key to encrypt with, some algorithm-specific parameters,|
   * and the data to encrypt (also known as "plaintext").
   * It returns a Promise which will be fulfilled with the encrypted data (also known as "ciphertext")."
   * 
   * format of ciphertext is: [Ciphertext][Authentication Tag] ! (iv not included)
   */
  const encryptedContent = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv , tagLength: 128 },  // AesGcmParams object. // adding tagLength (Authentication Tag Lenght) here to ensure it was generated.
    key,                          // key
    enc.encode(htmlContent)       // plaintext
  );

  tolog('#### ciphertext length: ', encryptedContent.byteLength); //DEBUG
  tolog('#### iv length: ', iv.byteLength); //DEBUG
  tolog('#### salt length: ', salt.byteLength); //DEBUG
  tolog('#### password length', password.length); //DEBUG
  
  return {
    salt: salt,
    iv: iv,
    ciphertext: encryptedContent,
  };
}


async function decryptHTMLFile(ciphertext, password, salt, iv) {
  tolog('entered decryptHTMLFile()'); //DEBUG
  
  tolog('\t ciphertext: ', ciphertext); //DEBUG
  tolog('\t password: ', password); //DEBUG
  tolog('\t iv: ', iv); //DEBUG
  tolog('\t salt: ', salt); //DEBUG

  if (!(ciphertext instanceof Uint8Array)) {
    ciphertext = new Uint8Array(ciphertext);
  }
  if (!(iv instanceof Uint8Array)) {
    iv = new Uint8Array(iv);
  }
  if (!(salt instanceof Uint8Array)) {
    salt = new Uint8Array(salt);
  }

  tolog('#### ciphertext length: ', ciphertext.byteLength); //DEBUG
  tolog('#### iv length: ', iv.byteLength); //DEBUG
  tolog('#### salt length: ', salt.byteLength); //DEBUG
  tolog('#### password ', password.byteLength); //DEBUG

  const key = await generateKeyFromPassword(password, salt);
  tolog('key: ', key); //DEBUG

  const decryptedContent = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv, tagLength: 128 },
    key,
    ciphertext
  ).catch(err => {
    console.error('Decryption failed: ', err);
    throw err;
  });
  
  tolog('decryptedContent: ', decryptedContent); //DEBUG
  return decryptedContent;
}


//----------------------------- Listeners --------------------------------------

browser.runtime.onStartup.addListener(() => {
  tolog("Extension has started now."); //DEBUG
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'encrypt') {
    tolog('Listener heard encrypt'); //DEBUG
    handleFileExport(message.passInput_enc);
  }
  else if (message.action === 'decrypt') {
    tolog('Listener heard decrypt'); //DEBUG
    handleFileImport(message.fileContent, message.passInput_dec);
  }

});

browser.action.onClicked.addListener(() => {
  tolog("User clicked on extension icon, opening sidebar."); //DEBUG
  browser.sidebarAction.open();
});

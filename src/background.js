// requests full bookmarks tree
let gettingTree = browser.bookmarks.getTree();


/* DEBUGGING MODE TOGGLE - enables logging into console */
const DEBUGGING_MODE = true;

/**
 * logs any arguments the func gets as is .
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
html_string = gettingTree.then((bookmarksTree) => {
  

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
});


/**
 * This function is using standart downloading method to save data into file.
 * (works)
 * 
 * NOT IN USE
 * 
 * @param {*} filename 
 * @param {*} contentPromise 
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
// downloadWithAnchor('bookmarks-export.html', html_string);


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
async function extractBookmarksFromHTML(document) {
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
  // tolog('document.body :\n', document.body);                         // DEBUG - <body>
  // tolog('document.body.children :\n', document.body.children);       // DEBUG - html collection
  // tolog('document.body.children[0] :\n', document.body.children[0]); // DEBUG - <h1>

  const global_DL = document.body.querySelector('dl'); // select the Definition List at root level
  process_HTML_node(global_DL); // call the func and actually process the root DL node
  
  tolog('extractBookmarksFromHTML finished. return :\n', foldersStack); //DEBUG
} // end - extractBookmarksFromHTML


async function handleFileExport(passInput_enc) {
  tolog('entered handleFileExport()'); //DEBUG

  // /**
  //  * works
  //  * @returns 
  //  */
  // async function zip_file() {
  //   const zip = new JSZip();

  //   zip.file(`bookmarks-export.html`, html_string); //add file to future zip
  
  //   var promise = null;
  //   if (JSZip.support.uint8array) {
  //     promise = zip.generateAsync({type : "uint8array"}); //option {type : "blob"}  // uint8array is good for processing raw binary data, so it better option in making incryption manipulations
  //   } else {
  //     promise = zip.generateAsync({type : "string"});
  //   }

  //   return promise;
  // }
  // const promise = await zip_file();
  // downloadWithBrowserAPI('bookmarks-export.zip', promise); // promise - zipped_file

  
  downloadWithBrowserAPI('bookmarks-export.zip', html_string); // promise - zipped_file
}


async function handleFileImport(content, passInput_dec) {
  tolog('entered handleFileImport()'); //DEBUG
  
  ///**
  // * problems
  // * @returns 
  // */
  // async function unzip_file(content) {
  //   tolog('entered unzip_file()'); //DEBUG
  //   try {
  //     var js_zip = new JSZip();
  //     const zip = await js_zip.loadAsync(content);
  //     const file = zip.file("bookmarks-export.html");
  //     if (file) {
  //       return await file.async("uint8array");
  //     } else {
  //       console.error("File not found in the zip archive.");
  //     }
  //   } catch (error) {
  //     console.error("Error unzipping file:", error);
  //   }
  // }
  // const unzipped_file = await unzip_file(content);
  // // read HTML to get bookmarks
  // const parser = new DOMParser();
  // const document = parser.parseFromString(unzipped_file, 'text/html');

  // read HTML to get bookmarks
  const parser = new DOMParser();
  const document = parser.parseFromString(content, 'text/html');
  const bookmarks = await extractBookmarksFromHTML(document); 

  tolog('Bookmarks:', bookmarks); //DEBUG

  tolog('Bookmarks imported successfully.'); // TAG: release
}


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'encrypt') {
    tolog('Listener heard encrypt'); //DEBUG
    handleFileExport(message.passInput_enc);
    // downloadWithBrowserAPI('bookmarks-export.html', html_string); //todo
    
  }
  else if (message.action === 'decrypt') {
    tolog('Listener heard decrypt'); //DEBUG
    handleFileImport(message.fileContent, message.passInput_dec);
  }

});


// browser.runtime.onStartup.addListener(() => {
//   tolog("Extension has started now.");
//   browser.sidebarAction.open(); // opens without clicking, too fast
// });


browser.action.onClicked.addListener(() => {
  tolog("User clicked on extension icon, opening sidebar."); //
  browser.sidebarAction.open();
});


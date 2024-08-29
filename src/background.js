// requests full bookmarks tree
let gettingTree = browser.bookmarks.getTree();

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
  
  console.log('generated HTML:'); //DEBUG
  console.log(html);              //DEBUG
  return html;
});

// var exporter = require('exporter');


/**
 * This function is using standart downloading method to save data into file.
 * (works)
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
downloadWithBrowserAPI('bookmarks-export.html', html_string);

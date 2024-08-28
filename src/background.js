
function onRejected(error) {
  console.log(`An error: ${error}`);
}

let gettingTree = browser.bookmarks.getTree();

console.log(`gettingTree:`, gettingTree);

console.log(`gettingTree.array:`, gettingTree.array);

gettingTree.then((promisedata) => {
  console.log("promisedata", promisedata)         //promise itself
  console.log("promisedata[0]", promisedata[0])   //the object "root________" of bookmarks list as promise obj
  console.log("promisedata[0].children", promisedata[0].children)       //children array
  console.log("promisedata[0].children[0]", promisedata[0].children[0]) //the content of "menu________"  (child of "root________")
  console.log("promisedata[0].children[1]", promisedata[0].children[1]) //the content of "toolbar_____"  (child of "root________")
  console.log("promisedata[0].children[1].children[1]", promisedata[0].children[1].children[1])   //the first bookmark in toolbar folder
}, onRejected);


html_string = gettingTree.then((bookmarksTree) => {

  /* Code bellow will generate html in Netscape-Bookmarks format. Generator made by reverse engineering. */
  
  /* This is initialization of html file that will cointain bookmarks in netscape format,
  so browsers could read it and import using existing build in tools. */
  let html = `
  <!DOCTYPE NETSCAPE-Bookmark-file-1>\n<!-- This is an automatically generated file by Encrypted Bookmarks Exporter Add-on. Please do not edit. -->\n<META http-equiv="Content-Type" content="text/html; charset=UTF-8">\n<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; img-src data: *; object-src 'none'">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks Export</H1>\n<DL><p>\n`;

  function makeIndent(indentLength) {
    return "\t".repeat(indentLength);
  }

  /**
   * function runs over all nodes in hierarchy of bookmarks.
   * this actually is promise that can be itself folder or url, or contain children that can be folder or url
   * 
   * @param {*} bookmarksTree - promise object with hierarchy of nested children
   */
  function processTree(bookmarksTree, indent) {
    
    // for every obj inside this promise 
    for (const promise of bookmarksTree) {
      
      if (promise.type == "folder") {
        
        html += `${makeIndent(indent)}<DT><H3>${promise.title || "Untitled Folder"}</H3>\n${makeIndent(indent)}<DL><p>\n`;
        
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
  
  html += `</DL><p>`;  // close html

  console.log(`generated HTML:`, html);

  return html;
});




// function makeIndent(indentLength) {
//   return ".".repeat(indentLength);
// }

// function logItems(bookmarkItem, indent) {
//   if (bookmarkItem.url) {
//     console.log(makeIndent(indent) + bookmarkItem.url);
//   } else {
//     console.log(`${makeIndent(indent)}Folder`);
//     indent++;
//   }
//   if (bookmarkItem.children) {
//     for (const child of bookmarkItem.children) {
//       logItems(child, indent);
//     }
//   }
//   indent--;
// }

// function logTree(bookmarkItems) {
//   logItems(bookmarkItems[0], 0);
// }

// function onRejected(error) {
//   console.log(`An error: ${error}`);
// }


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
})

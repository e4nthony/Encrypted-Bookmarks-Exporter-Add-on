// function showTab(index) {

//     

//     tabContents[0].classList.remove("active");
//     tabContents[1].classList.remove("active");
//     tabContents[2].classList.remove("active");
//     tabContents[3].classList.remove("active");
//     tabContents[index].classList.add("active");
    
// }



// Attach event listeners to each tab
// document.addEventListener('DOMContentLoaded', () => {
//     const tabs = document.querySelectorAll('.tabs span');
    
//     tabs.forEach(tab => {
//         tab.addEventListener('click', () => {
//             const index = tab.getAttribute('data-index');
//             showTab(parseInt(index, 10));
//         });
//     });
//     tabContents[index].classList.add("active");

// });



document.getElementById('tab_0_imp').addEventListener('click', () => {
    let tabContents = document.getElementsByClassName("tab-content");
    tabContents[0].classList.add("active");
    tabContents[1].classList.remove("active");
});


// document.getElementById('tab_0_imp').addEventListener('click', () => {
//     browser.windows.create({
//         url: '../menu.html',
//         type: 'popup',
//         width: 400,
//         height: 600
//     });
// });

// document.getElementById('tab_0_imp').addEventListener('click', () => {
//     browser.tabs.create({
//         url: '../menu.html'
//     });
// });


document.getElementById('tab_1_exp').addEventListener('click', () => {
    let tabContents = document.getElementsByClassName("tab-content");
    tabContents[0].classList.remove("active");
    tabContents[1].classList.add("active");
});



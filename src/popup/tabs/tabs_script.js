//---Listeners of TAB buttons at main window switching between Encrypt and Decrupt program modes.---

document.getElementById('tab_0_imp').addEventListener('click', () => {
    let tabContents = document.getElementsByClassName("tab-content");
    tabContents[0].classList.add("active");
    tabContents[1].classList.remove("active");

    var tabs = document.getElementsByClassName('tab-link');
    // tabs[0].style.background = '#6be0db8f'; // lightblue
    tabs[0].style.background = '#e6762c8f'; // lightorange
    tabs[1].style.background = '#fbeee0'; // idle

    document.body.style.boxShadow = 'inset 0 0 15px #e6762cb3';
});

document.getElementById('tab_1_exp').addEventListener('click', () => {
    let tabContents = document.getElementsByClassName("tab-content");
    tabContents[0].classList.remove("active");
    tabContents[1].classList.add("active");

    var tabs = document.getElementsByClassName('tab-link');
    tabs[0].style.background = '#fbeee0'; // idle
    tabs[1].style.background = '#f1c4718f'; // yellow

    document.body.style.boxShadow = 'inset 0 0 15px #f1c471f0'; //default
});


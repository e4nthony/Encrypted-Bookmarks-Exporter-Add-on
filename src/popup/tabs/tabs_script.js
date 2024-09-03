//---Listeners of TAB buttons at main window switching between Encrypt and Decrupt program modes.---

document.getElementById('tab_0_imp').addEventListener('click', () => {
    let tabContents = document.getElementsByClassName("tab-content");
    tabContents[0].classList.add("active");
    tabContents[1].classList.remove("active");
});

document.getElementById('tab_1_exp').addEventListener('click', () => {
    let tabContents = document.getElementsByClassName("tab-content");
    tabContents[0].classList.remove("active");
    tabContents[1].classList.add("active");
});

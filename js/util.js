function padContent(){
    let headerHeight = document.getElementById("banner").clientHeight +
        document.getElementById("chatter_box").clientHeight;
    let footerHeight = document.getElementById("footer").clientHeight;
    let content = document.getElementById("content");
    let totalHeight = document.documentElement.scrollHeight;
    if(document.getElementById("results").innerText == ""){
        content.setAttribute("style", "padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px; height: " + totalHeight + "px;");
    }else{
        content.setAttribute("style", "padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px;");
    }

}

function addTestText(){
    let loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    let results = document.getElementById("results");
    for(let i = 0; i<5; i++){
        loremIpsum += loremIpsum;
    }
    results.innerText = loremIpsum;
}
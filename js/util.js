function padContent(){
    let headerHeight = document.getElementById("banner").clientHeight +
        document.getElementById("chatter_box").clientHeight;
    let footerHeight = document.getElementById("footer").clientHeight;
    let content = document.getElementById("content");
    let totalHeight = document.documentElement.scrollHeight;
    if(document.getElementById("results").innerText == ""){
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px; height: " + totalHeight + "px;");
        document.getElementById("body").setAttribute("style", "overflow: hidden; height: 100%;");
    }else{
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px;");
        document.getElementById("body").removeAttribute("style");
    }

}

function addTestText(){
    let loremIpsum = "Lorem ipsum dolor sit amet.\n";
    let results = document.getElementById("results");
    for(let i = 0; i<5; i++){
        loremIpsum += loremIpsum;
    }
    results.innerText = loremIpsum;
}

function getPseudoHash(anyString){

}

console.log("hello")
window.onload = () => {

}
function show(params) {
    let cardSection = document.querySelectorAll(".food-cards")
    cardSection.forEach((e) => {
        e.style.display = "none"
    })
    // cardSection.style.display="none"
    let id = params;
    console.log(id)
    let showcard = document.getElementById(`${params}`);
    showcard.style.display = "flex"
    let btn = document.getElementById(`${params}1`)
    btn.classList.add("active")
    // if(btn.contains("active")){
    //     btn.classList.remove("active")
    // }
}

//slider
const container = document.querySelector(".slider")
const slide = document.querySelectorAll(".slide")
var currIndex = 1
var totalLength = slide.length 
var index = currIndex % totalLength
console.log(index)
if (index == 1) {
    const forward = next()
}

function next() {
    setInterval(() => {
        // style.transform=`translateX(${-currIndex * 100}%)`
        slide.forEach((x) => x.style.transform = `translateX(${-currIndex * 100}%)`)
        console.log("interval running")
        currIndex++;
        if (currIndex >= 2)
            currIndex = 0;
    }, 4500)
}
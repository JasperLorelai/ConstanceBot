const panorama = document.getElementById("main_panorama");

panorama.addEventListener("mousemove", () => {
    panorama.style.backgroundPositionX = event.pageX + "px";
});
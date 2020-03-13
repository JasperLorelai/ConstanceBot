const previewBox = document.getElementById("gallery_imagePreview");
const preview = document.getElementById("gallery_imagePreview_image");
const images = document.getElementsByClassName("gallery_image");

previewBox.style.width = "0";
previewBox.style.height = "0";

previewBox.addEventListener("click", () => {
    previewBox.style.width = "0";
    previewBox.style.height = "0";
});

for(let i = 0; i < images.length; i++) {
    images.item(i).addEventListener("click", () => {
        preview.src = images.item(i).src;
        previewBox.style.width = "100%";
        previewBox.style.height = "100%";
    });
}
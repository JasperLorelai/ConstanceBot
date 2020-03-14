async function copy(text) {
    if(navigator.clipboard) await navigator.clipboard.writeText(text);
    else {
        // Fallback copy.
        const copyElement = document.createElement("textarea");
        copyElement.value = text;
        copyElement.style.position="fixed";
        // noinspection JSCheckFunctionSignatures
        document.body.appendChild(copyElement);
        copyElement.focus();
        copyElement.select();
        document.execCommand("copy");
        // noinspection JSCheckFunctionSignatures
        document.body.removeChild(copyElement);
    }
}

function translateMarkdown(str) {
    while(str.includes("***")) str = str.replace("***","<strong>").replace("***","</strong>");
    while(str.includes("**")) str = str.replace("**","<b>").replace("**","</b>");
    while(str.includes("*")) str = str.replace("*","<i>").replace("*","</i>");
    str = str.replace(/\n/g, "<br>");
    while(str.includes("```")) str = str.replace("```","<code style='white-space:pre;font-family:Courier New,monospace'>").replace("```","</code>");
    while(str.includes("`")) str = str.replace("`","<code style='white-space:pre;font-family:Courier New,monospace'>").replace("`","</code>");
    while(str.includes("![](")) {
        let url = str.substr(str.indexOf("![](")+4,(str.indexOf(")",str.indexOf("![]("))-str.indexOf("![](")-4));
        str = str.substring(0,str.indexOf("![](")) + "<img width='90%' height='90%' alt='image.png' src=" + url + ">" + str.substring(str.indexOf(")",str.indexOf("![]("))+1);
    }
    return str;
}

async function onLoad() {
    // Setup copy elements.
    for(const element of document.getElementsByClassName("cmd")) {
        // Create an element to store this element's value.
        const copyArea = document.createElement("span");
        copyArea.innerHTML = element.innerHTML;
        element.innerHTML = "";
        // noinspection JSCheckFunctionSignatures
        element.appendChild(copyArea);
        element.addEventListener("click", function() {
            copy(copyArea.innerHTML);
        });
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");
        tooltip.innerHTML = "Click to copy";
        // noinspection JSCheckFunctionSignatures
        element.appendChild(tooltip);
    }
    // Setup downloads.
    const releases = await fetch("https://api.github.com/repos/JasperLorelai/minecraft-soundboard/releases").then(y => y.json());
    const downloadList = document.getElementById("download_list");
    downloadList.innerHTML = "";
    for(const release of releases) {
        // Append list item.
        const item = document.createElement("li");
        item.classList.add("download_release");
        // noinspection JSCheckFunctionSignatures
        downloadList.appendChild(item);
        // Add version tag element.
        const tag = document.createElement("span");
        tag.classList.add("download_tag");
        tag.innerHTML = release["tag_name"];
        // noinspection JSCheckFunctionSignatures
        item.appendChild(tag);
        // Add seperator.
        const seperator = document.createElement("span");
        seperator.classList.add("download_seperator");
        seperator.innerHTML = " - ";
        // noinspection JSCheckFunctionSignatures
        item.appendChild(seperator);
        // Add version name.
        const version = document.createElement("a");
        version.classList.add("download_name");
        version.innerHTML = release.name;
        version.href = release.assets[0]["browser_download_url"];
        version.target = "_blank";
        // noinspection JSCheckFunctionSignatures
        item.appendChild(version);
        // Add tooltip.
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");
        tooltip.innerHTML = "Click to Download<br>Downloads: <b>" + release.assets[0]["download_count"] + "</b>";
        // noinspection JSCheckFunctionSignatures
        version.appendChild(tooltip);
        // Add description button.
        if(!release.body) continue;
        const description = document.createElement("span");
        description.classList.add("download_description_button");
        description.innerHTML = "Description";
        // noinspection JSCheckFunctionSignatures
        item.appendChild(description);
        const description_inside = document.createElement("div");
        description_inside.classList.add("download_description_inside");
        description_inside.innerHTML = translateMarkdown(release.body);
        // noinspection JSCheckFunctionSignatures
        item.appendChild(description_inside);
        description.addEventListener("click", function() {
            toggle(description);
        });
        description_inside.addEventListener("click", function() {
            toggle(description);
        });
    }

    function toggle(element) {
        element.classList.toggle("download_description_button_active");
        const hidden = element.nextElementSibling;
        if(hidden.style.maxHeight) {
            hidden.style.maxHeight = null;
            hidden.style.padding = "0px 2.25%";
        }
        else {
            hidden.style.maxHeight = hidden.scrollHeight + "px";
            hidden.style.padding = "1% 2.25%";
        }
    }
}

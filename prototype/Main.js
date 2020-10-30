const {colorConvert, Discord} = require("../Libs");
const {Util, MessageEmbed} = Discord;

String.prototype.toFormalCase = function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
}
String.prototype.toTitleCase = function() {
    return this.split(" ").map(e => e.toFormalCase()).join(" ");
}
String.prototype.discordMKD = function() {
    let splits = this.split("\n").filter(l => l !== "---");
    for (let i = 0; i < splits.length; i++) {
        if (splits[i].startsWith("######") || splits[i].startsWith("#####") || splits[i].startsWith("####") || splits[i].startsWith("###") || splits[i].startsWith("##")) {
            splits[i] = splits[i].replace(/#{2,6}\s?/g, "**") + "**";
        }
        if (splits[i].startsWith("#")) splits[i] = "__**" + splits[i].substr(1) + "**__";
    }
    return splits.join("\n");
}
String.prototype.escapeMarkdown = function() {
    return Util.escapeMarkdown(this);
}

String.prototype.isJSON = function() {
    try {
        if (typeof JSON.parse(this) == "object") return true;
    }
    catch (e) {}
    return false;
}
String.prototype.isRegex = function() {
    try {
        new RegExp(this);
        return true;
    }
    catch (e) {}
    return false;
}
String.prototype.isURL = function() {
    try {
        new URL(this);
        return true;
    }
    catch (e) {}
    return false;
}
String.prototype.getColorFromString = function() {
    let matchedDigits = color.match(/([0-9]*(\.[0-9]*)?(?:[%|°])?)+/g).filter(e => e);
    if (this.startsWith("rgb(")) {
        matchedDigits = matchedDigits.map(e => e.endsWith("%") ? Math.round(e.substr(0, e.length - 1) / 100 * 255) : e);
        return colorConvert.rgb.hex(matchedDigits);
    }
    if (this.startsWith("hsl(")) {
        matchedDigits = matchedDigits.map(e => (e.endsWith("°") || e.endsWith("%")) ? Math.round(e.substr(0, e.length - 1)) : e);
        return colorConvert.hsl.hex(matchedDigits);
    }
    if (this.startsWith("#")) return this.substr(1);
    return colorConvert.keyword.hex(this);
}
String.prototype.getEmoji = function() {
    return this.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
}
String.prototype.getBufferFromString = function() {
    return Buffer.from(this.replace(/\\/g, "").replace("data:image/png;base64,", "").replace("==", ""), "base64");
}



Object.prototype.getKeyByValue = function(value) {
    return Object.keys(this).find(key => this[key] === value);
}



Date.prototype.toLocalFormat = function() {
    return this.getDate() + "/" + (this.getMonth() + 1) + "/" + this.getFullYear() + ", " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
}



MessageEmbed.prototype.setColorRandom = function() {
    return this.setColor(Math.floor(Math.random()*16777215));
}
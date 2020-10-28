const {Util, MessageEmbed} = require("discordjs");

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
Date.prototype.toLocalFormat = function() {
    return this.getDate() + "/" + (this.getMonth() + 1) + "/" + this.getFullYear() + ", " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
}
MessageEmbed.prototype.setColorRandom = function() {
    return this.setColor(Math.floor(Math.random()*16777215));
}

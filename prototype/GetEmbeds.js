const {Discord} = require("../Libs");
const {Message} = Discord;

Message.prototype.getEmbeds = function() {
    function getFile(url) {
        return  "attachment://" + url.substr(url.lastIndexOf("/") + 1);
    }
    if (this.embeds.length < 1) return null;
    return this.embeds.filter(e => e.type === "rich").map(e => {
        const embed = new Discord.MessageEmbed(e);
        if (embed.image && embed.image.url) embed.image.url = getFile(embed.image.url);
        if (embed.thumbnail && embed.thumbnail.url) embed.thumbnail.url = getFile(embed.thumbnail.url);
        if (embed.author && embed.author.iconURL) embed.author.iconURL = getFile(embed.author.iconURL);
        if (embed.footer && embed.footer.iconURL) embed.footer.iconURL = getFile(embed.footer.iconURL);
        return embed;
    });
}
Message.prototype.getFirstEmbed = function() {
    return this.getEmbeds()[0];
}

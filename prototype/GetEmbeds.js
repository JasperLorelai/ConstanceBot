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
        if (embed.author && embed.author.icon_url) embed.author.icon_url = getFile(embed.author.icon_url);
        if (embed.footer && embed.footer.icon_url) embed.footer.icon_url = getFile(embed.footer.icon_url);
        return embed;
    });
}
Message.prototype.getFirstEmbed = function() {
    return this.getEmbeds()[0];
}

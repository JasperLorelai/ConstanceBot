const Util = require("./Util");
const Stream = require("stream");
const md5 = require("md5");
module.exports = (Discord) => {
    function attachFile(resource, embed, func = () => {}) {
        let attachment;
        if (Util.isURL(resource)) {
            let name = resource.substr(resource.lastIndexOf("/") + 1);
            if (name.includes("?")) name = name.substr(0, name.indexOf("?"));
            if (name.includes("&")) name = name.substr(0, name.indexOf("&"));
            attachment = {
                attachment: resource,
                name: name
            };
        }
        if (resource instanceof Buffer || resource instanceof Stream.Readable) {
            attachment = {
                attachment: resource,
                name: md5(Date.now()) + ".png"
            };
        }
        if (!attachment) return embed;
        embed = func(embed.attachFiles([attachment]), "attachment://" + attachment.name);
        return embed;
    }

    Discord.MessageEmbed.prototype.setImagePermanent = function (resource) {
        return attachFile(resource, this, (embed, attachment) => embed.setImage(attachment));
    }
    Discord.MessageEmbed.prototype.setThumbnailPermanent = function (resource) {
        return attachFile(resource, this, (embed, attachment) => embed.setThumbnail(attachment));
    }
    Discord.MessageEmbed.prototype.setAuthorIcon = function (resource) {
        const author = this.author;
        return attachFile(resource, this, (embed, attachment) => embed.setAuthor(author.name, attachment, author.user));
    }
    Discord.MessageEmbed.prototype.setFooterIcon = function (resource) {
        return attachFile(resource, this, (embed, attachment) => embed.setFooter(embed.footer.text, attachment));
    }
}
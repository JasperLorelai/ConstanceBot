const Stream = require("stream");
const {MessageEmbed} = require("../Libs").Discord;

function attachFile(resource, embed, func = () => {}) {
    let attachment;
    if (resource.isURL()) {
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

MessageEmbed.prototype.setImagePermanent = function(resource) {
    return attachFile(resource, this, (embed, attachment) => embed.setImage(attachment));
}
MessageEmbed.prototype.setThumbnailPermanent = function(resource) {
    return attachFile(resource, this, (embed, attachment) => embed.setThumbnail(attachment));
}
MessageEmbed.prototype.setAuthorIcon = function(resource) {
    const author = this.author;
    return attachFile(resource, this, (embed, attachment) => embed.setAuthor(author.name, attachment, author.user));
}
MessageEmbed.prototype.setFooterIcon = function(resource) {
    return attachFile(resource, this, (embed, attachment) => embed.setFooter(embed.footer.text, attachment));
}

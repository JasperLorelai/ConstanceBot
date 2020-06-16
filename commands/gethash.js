// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "gethash",
    description: "Generates Sha1 checksum of the provided file.",
    guildOnly: false,
    async execute(message) {
        const {client, author, channel} = message;
        const {util, config} = client;
        try {
            const pack = message.attachments ? message.attachments.find(a => a.name.endsWith(".zip")) : null;
            if (!pack) {
                channel.send(author.toString(), util.embed("Sha1 Checksum Failed", "No attachment provided (must end with `zip` file extension).", config.color.red));
                return;
            }
            const buffer = await client.fetch(pack.url).then(y => y.buffer());
            message.delete({reason: "botIntent"});
            const hash = client.sha1(buffer);
            channel.send({
                embed: util.embed("Sha1 Checksum Generated", "`" + hash + "`"),
                content: author.toString(),
                files: [{
                    attachment: buffer,
                    name: hash + ".zip"
                }]
            });
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

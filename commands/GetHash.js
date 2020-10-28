// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "gethash",
    description: "Generates Sha1 checksum of the provided file.",
    guildOnly: false,
    async execute(message) {
        const Client = message.client;
        const {author, channel} = message;
        const {Util, Config} = Client;
        try {
            const pack = message.attachments ? message.attachments.find(a => a.name.endsWith(".zip")) : null;
            if (!pack) {
                channel.send(author.toString(), Util.embed("Sha1 Checksum Failed", "No attachment provided (must end with `zip` file extension).", Config.color.red));
                return;
            }
            const buffer = await Client.fetch(pack.url).then(y => y.buffer());
            message.delete({reason: "botIntent"});
            const hash = Client.sha1(buffer);
            channel.send({
                embed: Util.embed("Sha1 Checksum Generated", "`" + hash + "`"),
                content: author.toString(),
                files: [{
                    attachment: buffer,
                    name: hash + ".zip"
                }]
            });
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

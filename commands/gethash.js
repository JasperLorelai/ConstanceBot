// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "gethash",
    description: "Generates random MD5 hash.",
    guildOnly: false,
    async execute(message) {
        const {client, author, channel} = message;
        const {util} = client;
        try {
            channel.send(author.toString(), util.embed("Random MD5 Hash Generated", "`" + client.md5(new Date()) + "`"));
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

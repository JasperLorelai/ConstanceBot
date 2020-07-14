module.exports = {
    name: "unlink",
    description: "Unlink your Discord account from your Minecraft account.",
    guildOnly: true,
    guildWhitelist: [require("../files/config").guildData.mhap.id],
    async execute(message) {
        const {client, author, channel} = message;
        const {keyv, util, config} = client;
        let db = await keyv.get("minecraft") || {};
        if (!db[author.id]) {
            channel.send(author.toString(), util.embed("Discord Unlink", "Your account isn't linked.", config.color.red));
            return;
        }
        delete db[author.id];
        keyv.set("minecraft", db);
        channel.send(author.toString(), util.embed("Discord Unlink", "Your account was successfully unlinked.", config.color.green));
    }
};

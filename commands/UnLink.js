const {keyv, Util, Config} = require("../Libs");

module.exports = {
    name: "unlink",
    description: "Unlink your Discord account from your Minecraft account.",
    guildOnly: true,
    guildWhitelist: [Config.guildData.mhap.id],
    async execute(message) {
        const {author, channel} = message;

        let db = await keyv.get("minecraft") || {};
        if (!db[author.id]) {
            channel.send(author.toString(), Util.embed("Discord Unlink", "Your account isn't linked.", Config.color.red));
            return;
        }
        delete db[author.id];
        await keyv.set("minecraft", db);
        channel.send(author.toString(), Util.embed("Discord Unlink", "Your account was successfully unlinked.", Config.color.green));
    }
};

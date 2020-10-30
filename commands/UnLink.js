module.exports = {
    name: "unlink",
    description: "Unlink your Discord account from your Minecraft account.",
    guildOnly: true,
    guildWhitelist: ["mhap"],
    async execute(Libs, message) {
        const {Keyv, Util, Config} = Libs;
        const {author, channel} = message;

        let db = await Keyv.get("minecraft") || {};
        if (!db[author.id]) {
            channel.send(author.toString(), Util.embed("Discord Unlink", "Your account isn't linked.", Config.color.red));
            return;
        }
        delete db[author.id];
        await Keyv.set("minecraft", db);
        channel.send(author.toString(), Util.embed("Discord Unlink", "Your account was successfully unlinked.", Config.color.green));
    }
};

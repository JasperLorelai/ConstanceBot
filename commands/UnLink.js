module.exports = {
    name: "unlink",
    description: "Unlink your Discord account from your Minecraft account.",
    guildOnly: true,
    guildWhitelist: ["mhap"],
    async execute(Libs, message) {
        const {Keyv, Util, Config, ConditionException} = Libs;
        const {author} = message;

        let db = await Keyv.get("minecraft") || {};
        if (!db[author.id]) throw new ConditionException(author, "Discord Unlink", "Your account isn't linked.");
        delete db[author.id];
        await Keyv.set("minecraft", db);
        message.reply(Util.embed("Discord Unlink", "Your account was successfully unlinked.", Config.color.green));
    }
};

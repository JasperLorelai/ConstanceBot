module.exports = {
    name: "prefix",
    description: "Change command prefix of this server.",
    guildOnly: true,
    params: ["[prefix]"],
    perm: "admin",
    async execute(Libs, message, args) {
        const {Keyv, Util} = Libs;
        const guildID = message.guild.id;

        let db = await Keyv.get("guilds");
        if (!db) db = {};
        if (!db[guildID]) db[guildID] = {};
        db[guildID].prefix = args[0];
        await Keyv.set("guilds", db);
        await message.reply(Util.embed("Command Prefix", "**Prefix set to:** " + args[0]));
    }
};

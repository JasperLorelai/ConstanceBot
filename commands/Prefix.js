module.exports = {
    name: "prefix",
    description: "Change command prefix of this server.",
    guildOnly: true,
    params: ["[prefix]"],
    perm: "admin",
    async execute(Libs, message, args) {
        const {Keyv, Util} = Libs;
        const {channel, guild, author} = message;

        let db = await Keyv.get("guilds");
        if (!db) db = {};
        if (!db[guild.id]) db[guild.id] = {};
        db[guild.id].prefix = args[0];
        await Keyv.set("guilds", db);
        await channel.send(author.toString(), Util.embed("Command Prefix", "**Prefix set to:** " + args[0]));
    }
};

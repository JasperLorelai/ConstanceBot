const {keyv, Util} = require("../Libs");

module.exports = {
    name: "prefix",
    description: "Change command prefix of this server.",
    guildOnly: true,
    params: ["[prefix]"],
    perm: "admin",
    async execute(message, args) {
        const {channel, guild, author} = message;

        let db = await keyv.get("guilds");
        if (!db) db = {};
        if (!db[guild.id]) db[guild.id] = {};
        db[guild.id].prefix = args[0];
        await keyv.set("guilds", db);
        await channel.send(author.toString(), Util.embed("Command Prefix", "**Prefix set to:** " + args[0]));
    }
};

module.exports = {
    name: "prefix",
    description: "Change command prefix of this server.",
    guildOnly: true,
    params: ["[prefix]"],
    perm: "admin",
    async execute(message, args) {
        const {client, channel, guild, author} = message;
        const {keyv} = client;
        let db = await keyv.get("guilds");
        if(!db) db = {};
        if(!db[guild.id]) db[guild.id] = {};
        db[guild.id].prefix = args[0];
        await keyv.set("guilds", db);
        await channel.send(author.toString(), client.util.embed("Command Prefix", "**Prefix set to:** " + args[0]));
    }
};
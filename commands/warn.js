module.exports = {
    name: "warn",
    description: "Warn a user for a given reason. (Behind the scenes a user with 8 warnings should be permanently banned, but this isn't handled automatically.)",
    params: ["[user]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config, util, keyv} = client;
        try {
            const member = util.findGuildMember(args[0], guild);
            if (!member) {
                channel.send(author.toString(), util.embed("Warn", "User not found!", config.color.red));
                return;
            }
            args.shift();
            const reason = args.length ? args.join(" ") : null;
            let db = await keyv.get("guilds");
            if (!db) db = {};
            if (!db[guild.id]) db[guild.id] = {};
            if (!db[guild.id].warns) db[guild.id].warns = {};
            if (!db[guild.id].warns[member.id]) db[guild.id].warns[member.id] = [];
            db[guild.id].warns[member.id].push({date: new Date().toLocaleString(), mod: author.id, reason: reason});
            await keyv.set("guilds", db);
            channel.send(util.embed("Warn", "**User " + member.toString() + " has been warned by " + author.toString() + (reason ? " for:** " + reason : ".**")));
            member.send(util.embed(guild.name + " - Warn", "**You have been warned by " + author.toString() + (reason ? " for:** " + reason : ".**"), config.color.red));
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

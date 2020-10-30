module.exports = {
    name: "warn",
    description: "Warn a user for a given reason. (Behind the scenes a user with 8 warnings should be permanently banned, but this isn't handled automatically.)",
    params: ["[user]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Config, Util, keyv} = Libs;
        const {guild, channel, author} = message;

        try {
            const member = Util.findGuildMember(args[0], guild);
            if (!member) {
                channel.send(author.toString(), Util.embed("Warn", "User not found!", Config.color.red));
                return;
            }
            args.shift();
            const reason = args.length ? args.join(" ") : null;
            let db = await keyv.get("guilds");
            if (!db) db = {};
            if (!db[guild.id]) db[guild.id] = {};
            if (!db[guild.id].warns) db[guild.id].warns = {};
            if (!db[guild.id].warns[member.id]) db[guild.id].warns[member.id] = [];
            db[guild.id].warns[member.id].push({date: new Date().toLocalFormat(), mod: author.id, reason: reason});
            await keyv.set("guilds", db);
            channel.send(Util.embed("Warn", "**User " + member.toString() + " has been warned by " + author.toString() + (reason ? " for:** " + reason : ".**")));
            member.send(Util.embed(guild.name + " - Warn", "**You have been warned by " + author.toString() + (reason ? " for:** " + reason : ".**"), Config.color.red));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

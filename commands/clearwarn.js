module.exports = {
    name: "clearwarn",
    description: "Clears a warning from the database. This will clear all warn cases of the user, but if the optional case parameter is specified, only that case of the user will be cleared.",
    params: ["[user]", "(case)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config, util, keyv} = client;
        let member = util.findUser(args[0]) || args[0];
        if (typeof member !== "string") member = member.id;
        let db = await keyv.get("guilds");
        if (!db || !db[guild.id] || !db[guild.id].warns || !db[guild.id].warns[member]) {
            channel.send(author.toString(), util.embed("Clearing Warns", "This user has no warnings to be cleared.", config.color.red));
            return;
        }
        if (args[1]) {
            const warnCase = parseInt(args[1]);
            if (isNaN(warnCase)) {
                channel.send(author.toString(), util.embed("Clearing Warns", "Second command parameter, if specified, must be the case number.", config.color.red));
                return;
            }
            if (!db[guild.id].warns[member][warnCase]) {
                channel.send(author.toString(), util.embed("Clearing Warns", "This user has no warn with this case index.", config.color.red));
                return;
            }
            delete db[guild.id].warns[member][warnCase];
            db[guild.id].warns[member] = db[guild.id].warns[member].filter(e => e);
            await keyv.set("guilds", db);
            channel.send(author.toString(), util.embed("Clearing Warns", "Cleared warn case **" + warnCase + "**  for user <@" + member + ">."));
        }
        else {
            const count = db[guild.id].warns[member].length;
            delete db[guild.id].warns[member];
            await keyv.set("guilds", db);
            channel.send(author.toString(), util.embed("Clearing Warns", "Cleared **" + count + "** warnings for user <@" + member + ">."));
        }
    }
};

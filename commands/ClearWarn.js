module.exports = {
    name: "clearwarn",
    description: "Clears a warning from the database. This will clear all warn cases of the user, but if the optional case parameter is specified, only that case of the user will be cleared.",
    params: ["[user]", "(case)"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Util, Keyv, ConditionException} = Libs;
        const {guild, author} = message;

        let member = Util.findUser(args[0]) || args[0];
        if (typeof member !== "string") member = member.id;
        let db = await Keyv.get("guilds");
        if (!db || !db[guild.id] || !db[guild.id].warns || !db[guild.id].warns[member]) {
            throw new ConditionException(author, "Clearing Warns", "This user has no warnings to be cleared.");
        }
        if (args[1]) {
            const warnCase = parseInt(args[1]);
            if (isNaN(warnCase)) throw new ConditionException(author, "Clearing Warns", "Second command parameter, if specified, must be the case number.");
            if (!db[guild.id].warns[member][warnCase]) throw new ConditionException(author, "Clearing Warns", "This user has no warn with this case index.");
            delete db[guild.id].warns[member][warnCase];
            db[guild.id].warns[member] = db[guild.id].warns[member].filter(e => e);
            await Keyv.set("guilds", db);
            message.reply(Util.embed("Clearing Warns", "Cleared warn case **" + warnCase + "**  for user <@" + member + ">."));
        }
        else {
            const count = db[guild.id].warns[member].length;
            delete db[guild.id].warns[member];
            await Keyv.set("guilds", db);
            message.reply(Util.embed("Clearing Warns", "Cleared **" + count + "** warnings for user <@" + member + ">."));
        }
    }
};

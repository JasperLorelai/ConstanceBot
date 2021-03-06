module.exports = {
    name: "warns",
    description: "List all warn cases in this guild. Optionally, a user can be specified as a parameter to display only the warnings of that user in the guild.",
    aliases: ["warnings"],
    params: ["(user)"],
    guildOnly: true,
    async execute(Libs, message, args) {
        const {Util, Keyv, ConditionException} = Libs;
        const {guild} = message;
        const Client = message.client;

        let member = null;
        if (args[0]) {
            member = Util.findUser(args[0], guild) || args[0];
            if (!member) throw new ConditionException(message, "Warnings", "User specified not found!");
            if (typeof member !== "string") member = member["id"];
        }
        let db = await Keyv.get("guilds");
        if (!db || !db[guild.id] || !db[guild.id].warns) throw new ConditionException(message, "Warnings", "Warning database is empty. (for the moment... 😉)");
        if (member && !db[guild.id].warns[member]) throw new ConditionException(message, "Warnings", "This user has no warnings. (for the moment... 😉)");
        // Iterate through users and create an array of objects <user.id, warns string>.
        let warns = {};
        for (let [key, value] of Object.entries(db[guild.id].warns)) {
            let user = Client.users.resolve(key);
            user = user ? user.toString() : "`" + key + "`";
            // Format all warnings of this user.
            const theirWarns = value.map((c,i) => {
                let mod = Client.users.resolve(c.mod);
                mod = mod ? mod.toString() : "`" + c.mod + "`";
                return "**Case __#" + i + "__ (Mod: " + mod + ") [**`" + c.date + "`**]:** " + (c.reason || "*No reason specified.*");
            }).join("\n");
            warns[key] = "**User " + user + "  [`" + value.length + "`]:**\n" + theirWarns;
        }
        // Did the caller ask for member specific warns?
        if (member) {
            const theirWarns = warns[member];
            const msg = await message.reply(Util.embed("Warnings", (theirWarns.length >= 2000 ? "" : theirWarns)));
            if (theirWarns.length >= 2000) await Util.handlePrompt(msg, theirWarns, null, "\n\n");
        }
        else {
            const allWarns = Object.values(warns).join("\n\n");
            const msg = await message.reply(Util.embed("Warnings", (allWarns.length >= 2000 ? "" : allWarns)));
            if (allWarns.length >= 2000) await Util.handlePrompt(msg, allWarns, null, "\n\n");
        }
    }
};

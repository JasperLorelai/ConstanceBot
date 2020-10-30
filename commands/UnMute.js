module.exports = {
    name: "unmute",
    description: "Unmute a muted member.",
    aliases: [],
    params: ["[user]"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Util, Keyv, ConditionException} = Libs;
        const {guild, channel, author} = message;

        const member = Util.findGuildMember(args.join(" "), guild);
        if (!member) throw new ConditionException(author, "Mute", "User not found!");

        const mutedRole = Util.findRole("Muted", guild);
        if (!mutedRole) throw new ConditionException(author, "Mute", "Mute role was not initialised. This probably means nobody is muted.");
        if (!member.roles.cache.has(mutedRole.id)) throw new ConditionException(author, "Mute", "User is not muted.");

        let db = await Keyv.get("guilds");
        await member.roles.remove(mutedRole);
        await member.send(Util.embed(guild.name + " - Mute", "Your mute status has been lifted by " + author.toString() + " (**" + author.username + "**).")).catch(() => {});
        channel.send(Util.embed("Mute", member.toString() + "'s mute status has been lifted by " + author.toString() + "."));
        if (!(db && db[guild.id] && db[guild.id].muted && db[guild.id].muted[member.id])) return;
        delete db[guild.id].muted[member.id];
        await Keyv.set("guilds", db);
    }
};

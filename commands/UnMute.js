module.exports = {
    name: "unmute",
    description: "Unmute a muted member.",
    aliases: [],
    params: ["[user]"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Util, Config, Keyv} = Libs;
        const {guild, channel, author} = message;

        const member = Util.findGuildMember(args.join(" "), guild);
        if (!member) {
            await channel.send(author.toString(), Util.embed("Mute", "User not found!", Config.color.red));
            return;
        }

        const mutedRole = Util.findRole("Muted", guild);
        if (!mutedRole) {
            await channel.send(author.toString(), Util.embed("Mute", "Mute role was not initialised. This probably means nobody is muted.", Config.color.red));
            return;
        }
        if (!member.roles.cache.has(mutedRole.id)) {
            await channel.send(author.toString(), Util.embed("Mute", "User is not muted.", Config.color.red));
            return;
        }

        let db = await Keyv.get("guilds");
        await member.roles.remove(mutedRole);
        await member.send(Util.embed(guild.name + " - Mute", "Your mute status has been lifted by " + author.toString() + " (**" + author.username + "**).")).catch(() => {});
        channel.send(Util.embed("Mute", member.toString() + "'s mute status has been lifted by " + author.toString() + "."));
        if (!(db && db[guild.id] && db[guild.id].muted && db[guild.id].muted[member.id])) return;
        delete db[guild.id].muted[member.id];
        await Keyv.set("guilds", db);
    }
};

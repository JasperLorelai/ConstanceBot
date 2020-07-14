// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "unmute",
    description: "Unmute a muted member.",
    aliases: [],
    params: ["[user]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {util, config, keyv} = client;
        try {
            const member = util.findGuildMember(args.join(" "), guild);
            if (!member) {
                await channel.send(author.toString(), util.embed("Mute", "User not found!", config.color.red));
                return;
            }

            const mutedRole = util.findRole("Muted", guild);
            if (!mutedRole) {
                await channel.send(author.toString(), util.embed("Mute", "Mute role was not initialised. This probably means nobody is muted.", config.color.red));
                return;
            }
            if (!member.roles.cache.has(mutedRole.id)) {
                await channel.send(author.toString(), util.embed("Mute", "User is not muted.", config.color.red));
                return;
            }

            let db = await keyv.get("guilds");
            await member.roles.remove(mutedRole);
            await member.send(util.embed(guild.name + " - Mute", "Your mute status has been lifted by " + author.toString() + " (**" + author.username + "**).")).catch(() => {});
            channel.send(util.embed("Mute", member.toString() + "'s mute status has been lifted by " + author.toString() + "."));
            if (!(db && db[guild.id] && db[guild.id].muted && db[guild.id].muted[member.id])) return;
            delete db[guild.id].muted[member.id];
            await keyv.set("guilds", db);
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

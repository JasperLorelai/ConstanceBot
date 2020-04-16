module.exports = {
    name: "setnick",
    description: "Change a user's nickname.",
    aliases: ["nick"],
    params: ["[user]", "[new nick]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, channel, guild, author} = message;
        const {config, util} = client;
        const member = util.findGuildMember(args.shift(), guild);
        if (!member) {
            await channel.send(author.toString(), util.embed("Set Nick", "User not found in this guild!", config.color.red));
            return null;
        }
        await member.setNickname(args.join(" "));
        await channel.send(author.toString(), util.embed("Set Nick", "Nick for user " + member.toString() + " was changed to: **" + args.join(" ") + "**"));
    }
};

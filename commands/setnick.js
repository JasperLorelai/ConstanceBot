module.exports = {
    name: "setnick",
    description: "Change a user's nickname.",
    aliases: ["nick"],
    params: ["[user]", "[reset / new nick]"],
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
        const nickname = args.join(" ");
        await member.setNickname(nickname === "reset" ? "" : nickname);
        await channel.send(author.toString(), util.embed("Set Nick", "Nick for user " + member.toString() + " was " + (nickname === "reset" ? "reset." : "changed to: **" + nickname + "**")));
    }
};

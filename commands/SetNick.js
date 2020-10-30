module.exports = {
    name: "setnick",
    description: "Change a user's nickname.",
    aliases: ["nick"],
    params: ["[user]", "[reset / new nick]"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Config, Util} = Libs;
        const {channel, guild, author} = message;

        const member = Util.findGuildMember(args.shift(), guild);
        if (!member) {
            await channel.send(author.toString(), Util.embed("Set Nick", "User not found in this guild!", Config.color.red));
            return null;
        }
        const nickname = args.join(" ");
        await member.setNickname(nickname === "reset" ? "" : nickname);
        await channel.send(author.toString(), Util.embed("Set Nick", "Nick for user " + member.toString() + " was " + (nickname === "reset" ? "reset." : "changed to: **" + nickname + "**")));
    }
};
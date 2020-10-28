const {Config, Util} = require("../Libs");

module.exports = {
    name: "setnick",
    description: "Change a user's nickname.",
    aliases: ["nick"],
    params: ["[user]", "[reset / new nick]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {channel, guild, author} = message;

        try {
            const member = Util.findGuildMember(args.shift(), guild);
            if (!member) {
                await channel.send(author.toString(), Util.embed("Set Nick", "User not found in this guild!", Config.color.red));
                return null;
            }
            const nickname = args.join(" ");
            await member.setNickname(nickname === "reset" ? "" : nickname);
            await channel.send(author.toString(), Util.embed("Set Nick", "Nick for user " + member.toString() + " was " + (nickname === "reset" ? "reset." : "changed to: **" + nickname + "**")));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

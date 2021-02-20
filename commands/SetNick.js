module.exports = {
    name: "setnick",
    description: "Change a user's nickname.",
    aliases: ["nick"],
    params: ["[user]", "[reset / new nick]"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Util, ConditionException} = Libs;
        const member = Util.findGuildMember(args.shift(), message.guild);
        if (!member) throw new ConditionException(message, "Set Nick", "User not found in this guild!");
        const nickname = args.join(" ");
        await member.setNickname(nickname === "reset" ? "" : nickname);
        await message.reply(Util.embed("Set Nick", "Nick for user " + member.toString() + " was " + (nickname === "reset" ? "reset." : "changed to: **" + nickname + "**")));
    }
};

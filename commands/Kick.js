module.exports = {
    name: "kick",
    description: "Kick a guild member out of the guild. They will still be able to rejoin using an invite.",
    params: ["[user]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Util, ConditionException} = Libs;
        const {guild, channel, author} = message;

        let member = Util.findGuildMember(args[0], guild);
        if (!member) throw new ConditionException(author, "Kick Member", "User not found.");
        if (!member.kickable) throw new ConditionException(author, "Kick Member", "Cannot modify that user.");
        args.shift();
        await channel.send(author.toString(), Util.embed("Kicked Member", "**" + member.user.username + "** has been kicked from the server by user: " + author.toString() + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
        await member.kick(member.user.username + " has been kicked from the server by user: " + author.username + (args[0] ? "(reason: " + args.join(" ") + ")" : ""));
        await message.deleteBot();
    }
};

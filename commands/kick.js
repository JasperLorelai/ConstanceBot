module.exports = {
    name: "kick",
    description: "Kick a guild member out of the guild. They will still be able to rejoin using an invite.",
    params: ["[user]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config, util} = client;
        try {
            let member = util.findGuildMember(args[0], guild);
            if (!member) {
                await channel.send(author.toString(), util.embed("Kick Member", "User not found.", config.color.red));
                return;
            }
            if (!member.kickable) {
                await channel.send(author.toString(), util.embed("Kick Member", "Cannot modify that user.", config.color.red));
                return;
            }
            args.shift();
            await channel.send(author.toString(), util.embed("Kicked Member", "**" + member.user.username + "** has been kicked from the server by user: " + author.toString() + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
            await member.kick(member.user.username + " has been kicked from the server by user: " + author.username + (args[0] ? "(reason: " + args.join(" ") + ")" : ""));
            message.delete({reason: "botIntent"});
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

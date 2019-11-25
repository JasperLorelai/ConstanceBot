module.exports = {
    name: "kick",
    description: "Kick a guild member out of the guild. They will still be able to rejoin using an invite.",
    params: ["[user]","(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config} = client;
        const {red} = config.color;
        let member = config.findGuildMember(args[0], guild);
        if (!member) {
            await channel.send(config.embed("Kick Member", "User not found.", red));
            return;
        }
        if (!member.kickable) {
            await channel.send(config.embed("Kick Member", "Cannot modify that user.", red));
            return;
        }
        args.shift();
        await channel.send(config.embed("Kicked Member","**" + member.user.username + "** has been kicked from the server by user: " + author.toString() + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
        await member.kick(member.user.username + " has been kicked from the server by user: " + author.username + (args[0] ? "(reason: " + args.join(" ") + ")" : ""));
        message.delete();
        await config.modlogs.add("kick", guild, member.id, author.id, (args[0] ? args.join(" ") : null));
    }
};
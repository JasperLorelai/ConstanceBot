module.exports = {
    name: "kick",
    description: "Kick a guild member out of the guild. They will still be able to rejoin using an invite.",
    params: ["[user]","(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config} = client;
        let member = config.findGuildMember(args[0], guild);
        if (!member) {
            await channel.send(config.embed(client, "Kick Member", "User not found.", "ff0000"));
            return;
        }
        if (!member.kickable) {
            await channel.send(config.embed(client, "Kick Member", "Cannot modify that user.", "ff0000"));
            return;
        }
        args.shift();
        await channel.send(config.embed(client,"Kicked Member","**" + member.user.username + "** has been kicked from the server by user: " + author.toString() + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
        await member.kick(member.user.username + " has been kicked from the server by user: " + author.username + (args[0] ? "\nFor reason: " + args.join(" ") : ""));
        message.delete();
        await config.modlogs.add("kick", guild, member.id, author.id, (args[0] ? args.join(" ") : null));
    }
};
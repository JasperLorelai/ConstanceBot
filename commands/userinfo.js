module.exports = {
    name: "userinfo",
    description: "Displays information about a guild member.",
    aliases: ["uinfo", "info", "whois"],
    params: ["(user)"],
    guildOnly: true,
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config, util} = client;
        let member = args[0] ? util.findGuildMember(args.join(" "), guild) : message.member;
        if(!member) {
            await channel.send(author.toString(), util.embed("User Info", "User not found!", config.color.red));
            return;
        }
        const activity = member.presence && member.presence.activity ? member.presence.activity : null;
        const {user} = member;
        const roles = member.roles ? member.roles.filter(r => r.id !== guild.id) : null;
        const desc = (user.bot ? "**Is BOT:** true" : "") + "\n**Mention:** " + member.toString() + "\n**ID:** `<@" + member.id + ">`" + "\n**Joined at:** `" + member.joinedAt.toLocaleString() + "`" + "\n**Join Position:** " + util.getJoinPosition(member) + "\n**Registered at:** `" + user.createdAt.toLocaleString() + "`" + (member.nickname ? "\n**Nickname:** " + member.nickname : "") + "\n**Status:** " + member.presence.status.toFormalCase() + (activity ? "\n**Presence:** " + activity.name : "") + (roles ? "\n**Roles (" + roles.size + "):** " + roles.array().join(", ") : "");
        await channel.send(author.toString(), util.embed("User info for: " + user.username, desc).setThumbnail(user.displayAvatarURL({format: "png"})));
    }
};
module.exports = {
    name: "userinfo",
    description: "Displays information about a guild member.",
    aliases: ["uinfo", "info", "whois"],
    params: ["(user)"],
    guildOnly: true,
    async execute(message, args) {
        const Client = message.client;
        const {guild, channel, author} = message;
        const {Config, Util} = Client;
        const member = args[0] ? Util.findGuildMember(args.join(" "), guild) : message.member;
        if (!member) {
            await channel.send(author.toString(), Util.embed("User Info", "User not found!", Config.color.red));
            return;
        }
        const activity = member.presence && member.presence.activity ? member.presence.activity : null;
        const {user} = member;
        const roles = member.roles && member.roles.cache ? member.roles.cache.filter(r => r.id !== guild.id) : null;
        const linkedDB = await Client.keyv.get("minecraft") || {};
        let desc = (user.bot ? "**Is BOT:** true" : "") +
            "\n**Mention:** " + member.toString() +
            "\n**ID:** `<@" + member.id + ">`" +
            "\n**Joined at:** `" + member.joinedAt.toLocaleString() + "`" +
            "\n**Join Position:** " + Util.getJoinPosition(member) +
            "\n**Registered at:** `" + user.createdAt.toLocaleString() + "`" +
            (member.nickname ? "\n**Nickname:** " + member.nickname : "") +
            "\n**Status:** " + member.presence.status.toFormalCase() +
            (activity ? "\n**Presence:** " + activity.name : "") +
            (roles && roles.size ? "\n**Roles (" + roles.size + "):** " + roles.array().join(", ") : "");
        if (Config.guildData.mhap.id === guild.id) desc += "\n**Linked MC UUID:** `" + (linkedDB && linkedDB[member.id] ? linkedDB[member.id] : "Not linked") + "`";
        await channel.send(author.toString(), Util.embed("User info for: " + user.username, desc).setThumbnail(user.displayAvatarURL({format: "png"})));
    }
};

module.exports = {
    name: "userinfo",
    description: "Displays information about a guild member.",
    aliases: ["uinfo","info","whois"],
    params: ["(user)"],
    guildOnly: true,
    async execute(message, args) {
        const {client, guild, channel} = message;
        const {config} = client;
        let member = args[0] ? config.findGuildMember(args.join(" "), guild) : message.member;
        if(!member) {
            await channel.send(config.embed(client,"User Info", "User not found!", "ff0000"));
            return;
        }
        const activity = member.presence && member.presence.activity ? member.presence.activity : null;
        const {roles, user} = member;
        const desc =
            (user.bot ? "**Is BOT:** true" : "") +
            "\n**Mention:** " + member.toString() +
            "\n**ID:** `<@" + member.id + ">`" +
            "\n**Joined at:** " + member.joinedAt.toLocaleString() +
            "\n**Join Position:** " + guild.members.sort((a,b) => a.joinedAt-b.joinedAt).array().findIndex(m => m.id === member.id) +
            "\n**Registered at:** " + user.createdAt.toLocaleString() +
            (member.nickname ? "\n**Nickname:** " + member.nickname : "") +
            "\n**Status:** " + member.presence.status +
            (activity ? "\n**Presence:** " + activity.type.toFormalCase() + " " + activity.name : "") +
            "\n**Roles (" + roles.size + ")**: " + roles.map(r => r.toString()).join(", ");
        await channel.send(config.embed(client, "User info for: " + user.username, desc).setThumbnail(user.displayAvatarURL({format:"png"})));
    }
};
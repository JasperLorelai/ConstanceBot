module.exports = {
    name: "userinfo",
    description: "Displays information about a guild member.",
    aliases: ["uinfo", "info", "whois"],
    params: ["(user)"],
    guildOnly: true,
    async execute(Libs, message, args) {
        const {Config, Util, Keyv, ConditionException} = Libs;
        const {guild, channel, author} = message;

        const member = args[0] ? Util.findGuildMember(args.join(" "), guild) : message.member;
        if (!member) throw new ConditionException(author, "User Info", "User not found!");
        const activity = member.presence && member.presence.activity ? member.presence.activity : null;
        const {user} = member;
        const flags = user.flags ? user.flags.toArray().map(flag => "`" + flag.replace(/_/g, " ").toTitleCase() + "`") : [];
        const roles = member.roles && member.roles.cache ? member.roles.cache.filter(r => r.id !== guild.id) : null;
        const linkedDB = await Keyv.get("minecraft") || {};
        let desc = (user.bot ? "**Is BOT:** true" : "") +
            "\n**Mention:** " + member.toString() +
            "\n**ID:** `<@" + member.id + ">`" +
            "\n**Joined at:** `" + member.joinedAt.toLocalFormat() + "`" +
            "\n**Join Position:** " + Util.getJoinPosition(member) +
            "\n**Registered at:** `" + user.createdAt.toLocalFormat() + "`" +
            "\n**Tag:** `" + user.tag + "`" +
            (member.nickname ? "\n**Nickname:** " + member.nickname : "") +
            "\n**Status:** " + member.presence.status.toFormalCase() +
            (activity ? "\n**Presence:** " + activity.name : "") +
            (flags.length ? "\n**Flags:** " + flags.join(", ") : "") +
            (roles && roles.size ? "\n**Roles (" + roles.size + "):** " + roles.array().join(", ") : "");
        let embed = Util.embed("User info for: " + user.username, desc).setThumbnailPermanent(user.displayAvatarURL({format: "png"}));
        if (Config.guildData.mhap.id === guild.id) {
            let uuid = linkedDB && linkedDB[member.id] ? linkedDB[member.id] : null;
            embed.description += "\n**Linked MC UUID:** `" + (uuid ? uuid : "Not linked") + "`";
            if (uuid) embed = embed.setImagePermanent("https://visage.surgeplay.com/bust/128/" + uuid);
        }
        await channel.send(author.toString(), embed);
    }
};

module.exports = {
    name: "userinfo",
    description: "Displays information about a guild member.",
    aliases: ["uinfo", "info", "whois"],
    params: ["(user)"],
    guildOnly: true,
    async execute(Libs, message, args) {
        const {Util, Config, Keyv, ConditionException} = Libs;
        const {guild, channel, author} = message;

        const member = args[0] ? Util.findGuildMember(args.join(" "), guild) : message.member;
        if (!member) throw new ConditionException(author, "User Info", "User not found!");
        // FIXME
        //const activity = member.presence && member.presence.activity ? member.presence.activity : null;
        const {user} = member;
        const flags = user.flags ? user.flags.toArray().map(flag => "`" + flag.replace(/_/g, " ").toTitleCase() + "`") : [];
        const roles = member.roles && member.roles.cache ? member.roles.cache.filter(r => r.id !== guild.id) : null;
        let uuid = (await Keyv.get("minecraft"))?.[member.id];
        let desc = (user.bot ? "> **Is BOT:** true" : "") +
            "\n> **Mention:** " + member.toString() +
            "\n> **ID:** `" + member.toString() + "`" +
            "\n> **Joined at:** `" + member.joinedAt.toLocalFormat() + "`" +
            "\n> **Join Position:** " + Util.getJoinPosition(member) +
            "\n> **Registered at:** `" + user.createdAt.toLocalFormat() + "`" +
            "\n> **Tag:** `" + user.tag + "`" +
            (member.nickname ? "\n**> Nickname:** " + member.nickname : "") +
            //"\n> **Status:** " + member.presence.status.toFormalCase() +
            //(activity ? "\n> **Presence:** " + activity.name : "") +
            (flags.length ? "\n> **Flags:** " + flags.join(", ") : "") +
            (roles && roles.size ? "\n> **Roles (" + roles.size + "):** " + roles.array().join(", ") : "") +
            (uuid ? "\n> **Linked MC UUID:** `" + uuid + "`" : "");
        let embed = Util.embed("User info for: " + user.username, desc).setThumbnailPermanent(user.getAvatar());
        if (uuid) embed = embed.setImagePermanent(Config.urls.visage + "full/512/" + uuid);

        await channel.send(author.toString(), embed);
    }
};

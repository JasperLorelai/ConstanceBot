module.exports = {
    name: "mute",
    description: "The mute command is used to suppress another user's permission to send messages or connect to voice channels.",
    params: ["[user]", "[time]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Util, Config, Keyv, ms, ConditionException} = Libs;
        const {guild, channel, author} = message;
        const Client = message.client;

        // Setup mute.
        let muteRole = Util.findRole("Muted", guild);
        if (!muteRole) {
            muteRole = await guild.roles.create({
                data: {
                    name: "Muted",
                    color: "000001"
                },
                reason: "Mute role was missing."
            });
            const botRole = Util.findRole(guild.me.user.username, guild);
            if (botRole) await muteRole.setPosition(botRole.position - 1);
        }
        for (const c of guild.channels.cache.values()) {
            if (!c.viewable) continue;
            if (c.permissionOverwrites.has(muteRole.id)) continue;
            await c.createOverwrite(muteRole, {
                SEND_MESSAGES: false,
                CONNECT: false,
                ADD_REACTIONS: false,
                // Removing some default permissions as well.
                CREATE_INSTANT_INVITE: false,
                CHANGE_NICKNAME: false,
                SPEAK: false
            }, "Mute role setup.");
        }

        // Mute function.
        const member = Util.findGuildMember(args[0], guild);
        args.shift();
        if (!member) throw new ConditionException(author, "Mute", "User not found!");

        let time;
        try {
            time = ms(args[0]);
            args.shift();
            if (!Number.isInteger(time)) time = ms(time);
        }
        catch (e) {
            throw new ConditionException(author, "Mute", "Time format is invalid.");
        }

        const reason = args.join(" ");

        // Manage mute time.
        member.roles.add(muteRole);
        channel.send(Util.embed("Mute", "User " + member.toString() + " has been muted for **" + ms(time) + "** by " + author.toString() + (reason ? " for: **" + reason + "**" : "") + "."));
        if (Math.pow(2,32) - 1 > time) {
            Client.setTimeout(() => {
                member.roles.remove(muteRole);
            }, time);
        }
        let db = await Keyv.get("guilds");
        if (!db) db = {};
        if (!db[guild.id]) db[guild.id] = {};
        if (!db[guild.id].muted) db[guild.id].muted = {};
        db[guild.id].muted[member.id] = Date.now() + time;
        await Keyv.set("guilds", db);
    }
};

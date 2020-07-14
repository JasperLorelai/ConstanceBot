module.exports = {
    name: "mute",
    description: "The mute command is used to suppress another user's permission to send messages or connect to voice channels.",
    params: ["[user]", "[time]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {util, config, keyv} = client;
        try {
            // Setup mute.
            let muteRole = util.findRole("Muted", guild);
            if (!muteRole) {
                muteRole = await guild.roles.create({
                    data: {
                        name: "Muted",
                        color: "000001"
                    },
                    reason: "Mute role was missing."
                });
                const botRole = util.findRole(guild.me.user.username, guild);
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
            const member = util.findGuildMember(args[0], guild);
            args.shift();
            if (!member) {
                await channel.send(author.toString(), util.embed("Mute", "User not found!", config.color.red));
                return;
            }

            let time;
            try {
                time = client.ms(args[0]);
                args.shift();
                if (!Number.isInteger(time)) time = client.ms(time);
            }
            catch (e) {
                await channel.send(author.toString(), util.embed("Mute", "Time format is invalid.", config.color.red));
                return;
            }

            const reason = args.join(" ");

            // Manage mute time.
            member.roles.add(muteRole);
            channel.send(util.embed("Mute", "User " + member.toString() + " has been muted for **" + client.ms(time) + "** by " + author.toString() + (reason ? " for: **" + reason + "**" : "") + "."));
            if (Math.pow(2,32) - 1 > time) {
                client.setTimeout(() => {
                    member.roles.remove(muteRole);
                }, time);
            }
            let db = await keyv.get("guilds");
            if (!db) db = {};
            if (!db[guild.id]) db[guild.id] = {};
            if (!db[guild.id].muted) db[guild.id].muted = {};
            db[guild.id].muted[member.id] = new Date().getTime() + time;
            await keyv.set("guilds", db);
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

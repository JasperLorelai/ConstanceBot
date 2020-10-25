module.exports = {
    name: "mute",
    description: "The mute command is used to suppress another user's permission to send messages or connect to voice channels.",
    params: ["[user]", "[time]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const Client = message.client;
        const {guild, channel, author} = message;
        const {Util, Config, keyv} = Client;
        try {
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
            if (!member) {
                await channel.send(author.toString(), Util.embed("Mute", "User not found!", Config.color.red));
                return;
            }

            let time;
            try {
                time = Client.ms(args[0]);
                args.shift();
                if (!Number.isInteger(time)) time = Client.ms(time);
            }
            catch (e) {
                await channel.send(author.toString(), Util.embed("Mute", "Time format is invalid.", Config.color.red));
                return;
            }

            const reason = args.join(" ");

            // Manage mute time.
            member.roles.add(muteRole);
            channel.send(Util.embed("Mute", "User " + member.toString() + " has been muted for **" + Client.ms(time) + "** by " + author.toString() + (reason ? " for: **" + reason + "**" : "") + "."));
            if (Math.pow(2,32) - 1 > time) {
                Client.setTimeout(() => {
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
            await Util.handleError(message, e);
        }
    }
};

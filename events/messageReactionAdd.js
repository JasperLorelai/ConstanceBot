const Client = require("../Client");
const {Config, Util, keyv} = Client;
Client.on("messageReactionAdd", async (r, u) => {
    // Ignore custom reactions.
    if (!r) return;

    const {guild, channel, embeds} = r.message;
    // Ignore if the event was handled externally.
    if (r.message.deleted) return;

    // Handle To-Do list actions.
    if (channel.id === Config.guildData.main.channels.toDolist) {
        if (u.id === Client.user.id) return;
        const embed = r.message.getFirstEmbed();
        switch (r.emoji.toString()) {
            case "❌":
                Config.botLog().send(embed.setColor(Config.color.red).setTitle("To Do List Item - Declined"));
                await r.message.delete({reason: "botIntent"});
                break;
            case "✅":
                Config.botLog().send(embed.setColor(Config.color.green).setTitle("To Do List Item - Completed"));
                await r.message.delete({reason: "botIntent"});
                break;
            case "🗑":
                await r.message.delete({reason: "botIntent"});
                break;
        }
    }

    if (guild && channel["parent"] && embeds && embeds.length) {
        if (u.id === Client.user.id) return;
        let embed, member, pass;
        switch (channel["parent"].name) {
            // Handle Suggestion admin reactions.
            case "Suggestions":
                embed = embeds.find(e => e.title === "They suggested:");
                pass = member ? await Util.hasPerm(u, guild, "admin") : false;
                if (embed && ["✅", "❌"].includes(r.emoji.toString()) && !["accepted", "denied"].includes(channel["name"]) && pass) {
                    embed = embed.spliceFields(0, 1)
                        .addField("👍", "Upvotes: " + r.message.reactions.resolve("👍").count--, true)
                        .addField("👎", "Downvotes: " + r.message.reactions.resolve("👎").count--, true);
                    await r.message.reactions.removeAll();
                    if (r.emoji.toString() === "✅") {
                        await r.message.edit(embed.setColor(Config.color.green).setTitle("Accepted Suggestion:"));
                        // noinspection JSUnresolvedFunction
                        await channel.setName("accepted-" + channel["name"]);
                    }
                    if (r.emoji.toString() === "❌") {
                        await r.message.edit(embed.setColor(Config.color.red).setTitle("Denied Suggestion:"));
                        // noinspection JSUnresolvedFunction
                        await channel.setName("denied-" + channel["name"]);
                    }
                    // noinspection JSUnresolvedFunction
                    await channel.overwritePermissions([{id: guild.id, deny: "SEND_MESSAGES"}]);
                }
                break;
            // Handle Support ticket closing.
            case "Support Tickets":
                embed = embeds.find(e => e.title === "Problem:");
                if (embed) {
                    await r.users.remove(u.id);
                    if (!channel["name"].includes("solved")) {
                        let pass = false;
                        // Is creator.
                        if (u.id === embed.footer.text) pass = true;
                        // Isn't creator but has mod perms?
                        if (!pass) {
                            pass = await Util.hasPerm(u, guild, "admin");
                        }
                        if (pass) {
                            const msg = await channel.send(Util.embed("Closed", "This support ticket was closed by: " + u.toString(), Config.color.red).addField("React Actions", "❌ - Hide support ticket. (`Server Admin`)"));
                            await msg.react("❌");
                            // noinspection JSUnresolvedFunction
                            await channel.setName("solved-" + channel["name"]);
                            await r.message.reactions.removeAll();
                            await r.message.edit(embed.fields.splice(1, 1));
                        }
                    }
                }
                const closedTicket = embeds.find(e => e.title === "Closed");
                if (closedTicket) {
                    await r.users.remove(u.id);
                    if (member && await Util.hasPerm(u, guild, "admin")) {
                        // noinspection JSUnresolvedFunction
                        await channel.overwritePermissions([{id: guild.id, deny: "VIEW_CHANNEL"}]);
                        await r.message.reactions.removeAll();
                        await r.message.delete({reason: "botIntent"});
                    }
                }
                break;
            // Handle Staff Apps.
            case "Staff Applications":
                embed = embeds.find(e => e.fields[0].name === "Staff Application Actions");
                pass = member ? await Util.hasPerm(u, guild, "admin") : false;
                /// noinspection DuplicatedCode
                if (embed && ["✅", "❌"].includes(r.emoji.toString()) && !["accepted", "denied"].includes(channel["name"]) && pass) {
                    await r.message.reactions.removeAll();
                    const firstComponent = (await channel.messages.fetchPinned()).first();
                    if (r.emoji.toString() === "✅") {
                        await r.message.edit(embed.setColor(Config.color.green));
                        await firstComponent.edit(firstComponent.setColor(Config.color.green).setTitle("Accepted Staff Application:"));
                        // noinspection JSUnresolvedFunction
                        await channel.setName("accepted-" + channel["name"]);
                    }
                    if (r.emoji.toString() === "❌") {
                        await r.message.edit(embed.setColor(Config.color.red));
                        await firstComponent.edit(firstComponent.setColor(Config.color.red).setTitle("Denied Staff Application:"));
                        // noinspection JSUnresolvedFunction
                        await channel.setName("denied-" + channel["name"]);
                    }
                    // noinspection JSUnresolvedFunction
                    await channel.overwritePermissions([{id: guild.id, deny: "SEND_MESSAGES"}]);
                }
                break;
        }
    }

    // Poll - unique reactions.
    if (r.message.author.id === Client.user.id) {
        if (u.id === Client.user.id) return;
        const embed = r.message.ggetFirstEmbed();
        if (embed.footer && embed.footer.text.startsWith("Unique reactions | ")) {
            for (const reaction of r.message.reactions.cache.values()) {
                if (r.emoji.toString() === reaction.emoji.toString()) continue;
                await reaction.users.remove(u);
            }
        }
    }

    // Per message handling.
    const mhapData = Config.guildData.mhap;
    const nlData = Config.guildData.nl;
    const cctwcData = Config.guildData.cctwc;
    const member = await guild.members.resolve(u.id);
    if (u.id === Client.user.id) return;
    switch (r.message.id) {
        // Rule accept.
        case mhapData.messages.rules: {
            if (r.emoji.toString() !== "✅") return;
            let roles = mhapData.roles;
            if (member.roles.cache.has(roles.verified)) return;
            await member.roles.remove(roles.unverified);
            await member.roles.add(roles.verified);
            Util.log(guild, embed => embed.setColor(Config.color.green)
                .setTitle("User " + u.username + " has accepted the rules!")
                .setFooter("Member ID: " + u.id)
                .setThumbnailPermanent(u.displayAvatarURL())
                .setDescription(u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + guild.roles.resolve(mhapData.roles.verified).members.size + "/" + guild.memberCount + "**."));
            let db = await keyv.get("guilds");
            // Start of the welcomer process. Everything else is handled in "handleMsg.js".
            if (!db) db = {};
            const {mhap} = Config.guilds;
            if (!db[mhap]) db[mhap] = {};
            if (!db[mhap].welcomer) db[mhap].welcomer = {};
            const msg = await u.send(Util.embed("Roles - Poll (Stage 1)", "Would you like to be mentioned whenever we release a server poll?\nPlease reply with `yes` or `no`.", Config.color.yellow));
            db[mhap].welcomer[u.id] = msg.id;
            await keyv.set("guilds", db);
            break;
        }

        // Role toggle (MHAP)
        case mhapData.messages.info: {
            const roles = mhapData.roles;
            let role;
            switch (r.emoji.toString()) {
                case "🔞":
                    role = roles.nsfw;
                    break;
                case "📦":
                    role = roles.polls;
                    break;
                case "📆":
                    role = roles.events;
                    break;
                case "📰":
                    role = roles.changelog;
                    break;
            }
            if (!role) break;
            member.roles.add(role);
            break;
        }

        // Role toggle (NL)
        case nlData.messages.notify:
            if (r.emoji.toString() !== "👋") return;
            await guild.members.resolve(u.id).roles.add(nlData.roles.notify);
            break;

        // Role toggle (CCTWC)
        case cctwcData.messages.info:
            if (r.emoji.toString() !== "📦") return;
            await guild.members.resolve(u.id).roles.add(cctwcData.roles.polls);
            break;
    }
});

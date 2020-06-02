const client = require("../bot");
const {config, util, keyv} = client;
client.on("messageReactionAdd", async (r, u) => {
    const {guild, channel, embeds} = r.message;
    // Ignore if the event was handled externally.
    if (r.message.deleted) return;

    // Handle To-Do list actions.
    if (channel.id === config.channels.main.toDolist) {
        if (u.id === client.user.id) return;
        const embed = util.getEmbeds(r.message)[0];
        switch (r.emoji.toString()) {
            case "❌":
                config.botLog().send(embed.setColor(config.color.red).setTitle("To Do List Item - Declined"));
                await r.message.delete();
                break;
            case "✅":
                config.botLog().send(embed.setColor(config.color.green).setTitle("To Do List Item - Completed"));
                await r.message.delete();
                break;
            case "🗑":
                await r.message.delete();
                break;
        }
    }

    if (guild && channel["parent"] && embeds && embeds.length) {
        if (u.id === client.user.id) return;
        let embed, member, pass;
        switch (channel["parent"].name) {
            // Handle Suggestion admin reactions.
            case "Suggestions":
                embed = embeds.find(e => e.title === "They suggested:");
                member = guild.members.resolve(u.id);
                pass = member ? await util.getPerms(member, "admin") : false;
                if (embed && ["✅", "❌"].includes(r.emoji.toString()) && !["accepted", "denied"].includes(channel["name"]) && pass) {
                    embed = embed.spliceFields(0, 1)
                        .addField("👍", "Upvotes: " + r.message.reactions.resolve("👍").count--, true)
                        .addField("👎", "Downvotes: " + r.message.reactions.resolve("👎").count--, true);
                    await r.message.reactions.removeAll();
                    if (r.emoji.toString() === "✅") {
                        await r.message.edit(embed.setColor(config.color.green).setTitle("Accepted Suggestion:"));
                        // noinspection JSUnresolvedFunction
                        await channel.setName("accepted-" + channel["name"]);
                    }
                    if (r.emoji.toString() === "❌") {
                        await r.message.edit(embed.setColor(config.color.red).setTitle("Denied Suggestion:"));
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
                            const member = guild.members.resolve(u.id);
                            if (member) pass = await util.getPerms(member, "admin");
                        }
                        if (pass) {
                            const msg = await channel.send(util.embed("Closed", "This support ticket was closed by: " + u.toString(), config.color.red).addField("React Actions", "❌ - Hide support ticket. (`Server Admin`)"));
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
                    const member = guild.members.resolve(u.id);
                    if (member && await util.getPerms(member, "admin")) {
                        // noinspection JSUnresolvedFunction
                        await channel.overwritePermissions([{id: guild.id, deny: "VIEW_CHANNEL"}]);
                        await r.message.reactions.removeAll();
                        await r.message.delete();
                    }
                }
                break;
            // Handle Staff Apps.
            case "Staff Applications":
                embed = embeds.find(e => e.fields[0].name === "Staff Application Actions");
                member = guild.members.resolve(u.id);
                pass = member ? await util.getPerms(member, "admin") : false;
                /// noinspection DuplicatedCode
                if (embed && ["✅", "❌"].includes(r.emoji.toString()) && !["accepted", "denied"].includes(channel["name"]) && pass) {
                    await r.message.reactions.removeAll();
                    const firstComponent = (await channel.messages.fetchPinned()).first();
                    if (r.emoji.toString() === "✅") {
                        await r.message.edit(embed.setColor(config.color.green));
                        await firstComponent.edit(firstComponent.setColor(config.color.green).setTitle("Accepted Staff Application:"));
                        // noinspection JSUnresolvedFunction
                        await channel.setName("accepted-" + channel["name"]);
                    }
                    if (r.emoji.toString() === "❌") {
                        await r.message.edit(embed.setColor(config.color.red));
                        await firstComponent.edit(firstComponent.setColor(config.color.red).setTitle("Denied Staff Application:"));
                        // noinspection JSUnresolvedFunction
                        await channel.setName("denied-" + channel["name"]);
                    }
                    // noinspection JSUnresolvedFunction
                    await channel.overwritePermissions([{id: guild.id, deny: "SEND_MESSAGES"}]);
                }
                break;
        }
    }

    // Rule accept.
    if (r.message.id === config.messages.mhap.rules && r.emoji.toString() === "✅") {
        if (u.id === client.user.id) return;
        const member = await guild.members.resolve(u.id);
        if (member.roles.cache.has(config.roles.mhap.verified)) return;
        await member.roles.remove(config.roles.mhap.unverified);
        await member.roles.add(config.roles.mhap.verified);
        util.log(guild, embed => embed.setColor(config.color.green)
            .setTitle("User " + u.username + " has accepted the rules!")
            .setFooter("Member ID: " + u.id)
            .setThumbnail(u.displayAvatarURL())
            .setDescription(u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + guild.roles.resolve(config.roles.mhap.verified).members.size + "/" + guild.memberCount + "**."));
        let db = await keyv.get("guilds");
        // Start of the welcomer process. Everything else is handled in "handleMsg.js".
        if (!db) db = {};
        const {mhap} = config.guilds;
        if (!db[mhap]) db[mhap] = {};
        if (!db[mhap].welcomer) db[mhap].welcomer = {};
        const msg = await u.send(util.embed("Roles - Poll (Stage 1)", "Would you like to be mentioned whenever we release a server poll?\nPlease reply with `yes` or `no`.", config.color.yellow));
        db[mhap].welcomer[u.id] = msg.id;
        await keyv.set("guilds", db);
    }

    // Poll - unique reactions.
    if (r.message.author.id === client.user.id) {
        if (u.id === client.user.id) return;
        const embed = util.getEmbeds(r.message)[0];
        if (embed.hexColor === config.color.poll && embed.footer.text.startsWith("Unique reactions | ")) {
            for (const reaction of r.message.reactions.cache.values()) {
                console.log(r.emoji.toString() === reaction.emoji.toString());
                if (r.emoji.toString() === reaction.emoji.toString()) continue;
                await reaction.users.remove(u);
            }
        }
    }

    // Role toggles.
    if (r.message.id === config.messages.nl.notify && r.emoji.toString() === "👋") {
        await guild.members.resolve(u.id).roles.add(config.roles.nl.notify);
    }
    if (config.messages.home && r.message.id === config.messages.home) {
        if (u.id === client.user.id) return;
        const member = await guild.members.resolve(u.id);
        const roles = config.roles.mhap;
        switch (r.emoji.toString()) {
            case "🔞":
                member.roles.add(roles.nsfw);
                break;
            case "📦":
                member.roles.add(roles.polls);
                break;
            case "📆":
                member.roles.add(roles.events);
                break;
            case "📰":
                member.roles.add(roles.changelog);
                break;
        }
    }
});

const Client = require("../Client");
const {Config, Util} = require("../Libs");

Client.on("messageReactionAdd", async (r, u) => {
    // Ignore custom reactions.
    if (!r) return;

    const {guild, channel, embeds} = r.message;
    // Ignore if the event was handled externally.
    if (r.message.deleted) return;

    // Handle To-Do list actions.
    if (channel.id === Config.guildData.main.channels.toDoList) {
        if (u.id === Client.user.id) return;
        const embed = r.message.getFirstEmbed();
        switch (r.emoji.toString()) {
            case "❌":
                Config.botLog().send(embed.setColor(Config.color.red).setTitle("To Do List Item - Declined"));
                await r.message.deleteBot();
                break;
            case "✅":
                Config.botLog().send(embed.setColor(Config.color.green).setTitle("To Do List Item - Completed"));
                await r.message.deleteBot();
                break;
            case "🗑":
                await r.message.deleteBot();
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
                        await channel.setName("accepted-" + channel["name"]);
                    }
                    if (r.emoji.toString() === "❌") {
                        await r.message.edit(embed.setColor(Config.color.red).setTitle("Denied Suggestion:"));
                        await channel.setName("denied-" + channel["name"]);
                    }
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
                            await channel.setName("solved-" + channel["name"]);
                            await r.message.reactions.removeAll();
                            await r.message.edit(embed.fields.splice(1, 1));
                        }
                    }
                }
                const closedTicket = embeds.find(e => e.title === "Closed");
                if (closedTicket) {
                    await r.users.remove(u.id);
                    if (await Util.hasPerm(u, guild, "admin")) {
                        console.log("hiding");
                        await channel.overwritePermissions([{id: guild.id, deny: "VIEW_CHANNEL"}]);
                        await r.message.reactions.removeAll();
                        await r.message.deleteBot();
                    }
                }
                break;
            // Handle Staff Apps.
            case "Staff Applications":
                embed = embeds.find(e => e.fields[0].name === "Staff Application Actions");
                pass = member ? await Util.hasPerm(u, guild, "admin") : false;
                if (embed && ["✅", "❌"].includes(r.emoji.toString()) && !["accepted", "denied"].includes(channel["name"]) && pass) {
                    await r.message.reactions.removeAll();
                    const firstComponent = (await channel.messages.fetchPinned()).first();
                    if (r.emoji.toString() === "✅") {
                        await r.message.edit(embed.setColor(Config.color.green));
                        await firstComponent.edit(firstComponent.setColor(Config.color.green).setTitle("Accepted Staff Application:"));
                        await channel.setName("accepted-" + channel["name"]);
                    }
                    if (r.emoji.toString() === "❌") {
                        await r.message.edit(embed.setColor(Config.color.red));
                        await firstComponent.edit(firstComponent.setColor(Config.color.red).setTitle("Denied Staff Application:"));
                        await channel.setName("denied-" + channel["name"]);
                    }
                    await channel.overwritePermissions([{id: guild.id, deny: "SEND_MESSAGES"}]);
                }
                break;
        }
    }

    if (r.message.author.id === Client.user.id && u.id !== Client.user.id) {
        let embed = r.message.getFirstEmbed();
        const emoji = r.emoji.toString();
        if (embed.footer) {
            const {text} = embed.footer;
            // Poll - unique reactions.
            if (text.startsWith("Unique reactions | ")) {
                for (const reaction of r.message.reactions.cache.values()) {
                    if (r.emoji.toString() === reaction.emoji.toString()) continue;
                    await reaction.users.remove(u);
                }
            }
            // Welcomer.
            const welcomerKey = "Welcomer | ";
            if (text.startsWith(welcomerKey) && ["✅", "❌"].includes(emoji)) {
                const split = text
                    .substr(welcomerKey.length, text.indexOf(" | " + Util.getBaseFooter()))
                    .split("_")
                    .map(e => e.trim());
                if (split.length !== 2) return;

                const guildID = split[0];
                const part = parseInt(split[1]);

                let guildName;
                let guildData;

                // Verify guild name.
                for (const guildKey of Object.keys(Config.guildData)) {
                    const guild = Config.guildData[guildKey];
                    if (guild.id !== guildID) continue;
                    guildName = guildKey;
                    guildData = guild;
                    break;
                }

                if (!(guildName && guildData.welcomer)) return;
                const {welcomer} = guildData;
                if (part + 1 === Object.keys(welcomer).length || (part === 0 && emoji === "❌")) {
                    r.message.deleteBot();
                    return;
                }

                embed = embed.setFooterText(welcomerKey + guildID + "_" + (part + 1) + " | " + Util.getBaseFooter());

                const currentPart = welcomer[part];
                const nextPart = welcomer[part + 1];
                if (nextPart.text) embed = embed.setDescription(nextPart.text);

                if (currentPart.role && guildData.roles && emoji === "✅") {
                    const roleName = currentPart.role;
                    const roleID = guildData.roles[roleName];
                    const guild = Client.guilds.resolve(guildID);
                    if (roleID && guild) {
                        const member = guild.members.resolve(u.id);
                        if (member) member.roles.add(roleID);
                    }
                }

                await r.message.deleteBot();
                const msg = await channel.send(embed);
                await msg.react("✅");
                await msg.react("❌");
            }
        }
    }

    // Per message handling.
    if (!guild) return;
    const mhapData = Config.guildData.mhap;
    const nlData = Config.guildData.nl;
    const cctwcData = Config.guildData.cctwc;
    const member = guild.members.resolve(u.id);
    if (u.id === Client.user.id) return;
    switch (r.message.id) {
        // Rule accept.
        case mhapData.messages.rules: {
            if (r.emoji.toString() !== "✅") break;
            let roles = mhapData.roles;
            if (member.roles.cache.has(roles.verified)) break;
            await member.roles.remove(roles.unverified);
            await member.roles.add(roles.verified);
            Util.log(guild, embed => embed.setColor(Config.color.green)
                .setTitle("User " + u.username + " has accepted the rules!")
                .setFooterText("Member ID: " + u.id)
                .setThumbnailPermanent(u.getAvatar())
                .setDescription(u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + guild.roles.resolve(mhapData.roles.verified).members.size + "/" + guild.memberCount + "**."));

            // Start of the welcomer process.
            if (!mhapData.welcomer || !mhapData.welcomer.length) return;
            const first = mhapData.welcomer[0];
            if (!first || !first.text) return;
            let embed = Util.embed("Notification Roles", first.text);
            embed = embed.setFooterText("Welcomer | " + mhapData.id + "_0 | " + embed.footer.text);
            const msg = await author.send(embed);
            await msg.react("✅");
            await msg.react("❌");
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

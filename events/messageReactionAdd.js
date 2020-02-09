const client = require("../server");
const {config, util, keyv} = client;
client.on("messageReactionAdd", async (r, u) => {
    const {guild, channel, embeds} = r.message;
    // Ignore if the event was handled externally.
    if(r.message.deleted) return;

    // Handle To-Do list actions.
    if(channel.id === config.channels.todolist) {
        if(u.id === client.user.id) return;
        const embed = util.getEmbed(r.message);
        switch(r.emoji.toString()) {
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

    // Handle Suggestion admin reactions.
    if(guild && channel["parent"] && channel["parent"].name === "Suggestions" && embeds && embeds.length) {
        if(u.id === client.user.id) return;
        let suggestion = embeds.find(e => e.title === "They suggested:");
        const member = guild.members.resolve(u.id);
        const pass = member ? await util.getPerms(member, "admin") : false;
        if(suggestion && ["✅", "❌"].includes(r.emoji.toString()) && !["accepted", "denied"].includes(channel["name"]) && pass) {
            suggestion = suggestion.spliceField(0, 1)
                .addField("👍", "Upvotes: " + r.message.reactions.resolve("👍").count--, true)
                .addField("👎", "Downvotes: " + r.message.reactions.resolve("👎").count--, true);
            await r.message.reactions.removeAll();
            if(r.emoji.toString() === "✅") {
                await r.message.edit(suggestion.setColor(config.color.green).setTitle("Accepted Suggestion:"));
                // noinspection JSUnresolvedFunction
                await channel.setName("accepted-" + channel["name"]);
            }
            if(r.emoji.toString() === "❌") {
                await r.message.edit(suggestion.setColor(config.color.red).setTitle("Denied Suggestion:"));
                // noinspection JSUnresolvedFunction
                await channel.setName("denied-" + channel["name"]);
            }
            // noinspection JSUnresolvedFunction
            await channel.overwritePermissions({permissionOverwrites: [{id: guild.id, deny: "SEND_MESSAGES"}]});
        }
    }

    // Handle Support ticket closing.
    if(guild && channel["parent"] && channel["parent"].name === "Support Tickets" && embeds && embeds.length) {
        if(u.id === client.user.id) return;
        const ticket = embeds.find(e => e.title === "Problem:");
        if(ticket) {
            await r.users.remove(u.id);
            if(!channel["name"].includes("solved")) {
                let pass = false;
                // Is creator.
                if(u.id === ticket.footer.text) pass = true;
                // Isn't creator but has mod perms?
                if(!pass) {
                    const member = guild.members.resolve(u.id);
                    if(member) pass = await util.getPerms(member, "admin");
                }
                if(pass) {
                    const msg = await channel.send(util.embed("Closed", "This support ticket was closed by: " + u.toString(), config.color.red).addField("React Actions", "❌ - Hide support ticket. (`Server Admin`)"));
                    await msg.react("❌");
                    // noinspection JSUnresolvedFunction
                    await channel.setName("solved-" + channel["name"]);
                    await r.message.reactions.removeAll();
                    await r.message.edit(ticket.fields.splice(1, 1));
                }
            }
        }
        const closedTicket = embeds.find(e => e.title === "Closed");
        if(closedTicket) {
            await r.users.remove(u.id);
            const member = guild.members.resolve(u.id);
            if(member && await util.getPerms(member, "admin")) {
                // noinspection JSUnresolvedFunction
                await channel.overwritePermissions({permissionOverwrites: [{id: guild.id, deny: "VIEW_CHANNEL"}]});
                await r.message.reactions.removeAll();
                await r.message.delete();
            }
        }
    }

    // Rule accept.
    if(r.message.id === config.messages.rules && r.emoji.toString() === "✅") {
        if(u.id === client.user.id) return;
        const member = await guild.members.resolve(u.id);
        if(member.roles.has(config.roles.verified)) return;
        await member.roles.remove(config.roles.unverified);
        await member.roles.add(config.roles.verified);
        util.log(guild, embed => embed.setColor(config.color.green)
            .setTitle("User " + u.username + " has accepted the rules!")
            .setFooter("Member ID: " + u.id)
            .setThumbnail(u.displayAvatarURL())
            .setDescription(u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + guild.roles.resolve(config.roles.verified).members.size + "/" + guild.memberCount + "**."));
        let db = await keyv.get("guilds");
        // Start of the welcomer process. Everything else is handled in "handleMsg.js".
        if(!db) db = {};
        const {mhapGuild} = config.guilds;
        if(!db[mhapGuild]) db[mhapGuild] = {};
        if(!db[mhapGuild].welcomer) db[mhapGuild].welcomer = {};
        const msg = await u.send(util.embed("Roles - Poll (Stage 1)", "Would you like to be mentioned whenever we release a server poll?\nPlease reply with `yes` or `no`.", config.color.yellow));
        db[mhapGuild].welcomer[u.id] = msg.id;
        await keyv.set("guilds", db);
    }

    // Role toggles.
    if(config.messages.home && r.message.id === config.messages.home) {
        if(u.id === client.user.id) return;
        const member = await guild.members.resolve(u.id);
        switch(r.emoji.toString()) {
            case "🔞":
                member.roles.add(config.roles.nsfw);
                break;
            case "📦":
                member.roles.add(config.roles.polls);
                break;
            case "📆":
                member.roles.add(config.roles.events);
                break;
            case "📰":
                member.roles.add(config.roles.changelog);
                break;
        }
    }
});
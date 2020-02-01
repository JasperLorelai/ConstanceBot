const client = require("../bot");
const {config, keyv} = client;
client.on("messageReactionAdd", async (r, u) => {
    const {guild, channel, embeds} = r.message;
    // Ignore if the event was handled externally.
    if(r.message.deleted) return;

    if(channel.id === config.channels.todolist) {
        if(u.id === client.user.id) return;
        if(!["❌","✅"].includes(r.emoji.toString())) return;
        const embed = config.getEmbed(r.message);
        await r.message.delete();
        if(r.emoji.toString() === "❌") config.botLog().send(embed.setColor(config.color.red).setTitle("To Do List Item - Declined"));
        if(r.emoji.toString() === "✅") config.botLog().send(embed.setColor(config.color.green).setTitle("To Do List Item - Completed"));
    }

    // Handle Suggestion admin reactions.
    if(guild && channel["parent"] && channel["parent"].name === "Suggestions" && embeds && embeds.length) {
        if(u.id === client.user.id) return;
        const suggestion = embeds.find(e => e.title === "They suggested:");
        const member = guild.members.resolve(u.id);
        const pass = member ? await config.getPerms(member, "mod") : false;
        if(suggestion && ["✅", "❌"].includes(r.emoji.toString()) && !["accepted", "denied"].includes(channel["name"]) && pass) {
            await r.users.remove(u.id);
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
                    if(member) pass = await config.getPerms(member, "admin");
                }
                if(pass) {
                    const msg = await channel.send(config.embed("Closed", "This support ticket was closed by: " + u.toString(), config.color.red).addField("React Actions", "❌ - Hide support ticket. (`Server Admin`)"));
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
            if(member && await config.getPerms(member, "admin")) {
                // noinspection JSUnresolvedFunction
                await channel.overwritePermissions({permissionOverwrites: [{id: guild.id, deny: "VIEW_CHANNEL"}]});
            }
        }
    }

    // Rule accept.
    if(r.message.id === config.messages.rules && r.emoji.toString() === "✅") {
        if(u.id === client.user.id) return;
        const member = await guild.members.resolve(u.id);
        if(member.roles.has(config.roles.verified)) return;
        // TODO: Remove comments.
        //await member.roles.remove(config.roles.unverified);
        //await member.roles.add(config.roles.verified);
        // TODO: Remove comment mid statement.
        config.log(guild, embed => embed.setColor(config.color.green)
            .setTitle("User " + u.username + " has accepted the rules!")
            .setFooter("Member ID: " + user.id)
            .setThumbnail(user.displayAvatarURL())
            .setDescription(u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + /*guild.roles.resolve(config.roles.verified).members.size + "/"*/ +guild.memberCount + "**."));
        await u.send(config.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Boku No Hero Academia** manga and anime. The server is not modded. All of our content is made with the help of plugins and our wonderful content creators!\n\n" + "**IP:** " + config.defaultIP + "\n" + "**Version:** Release 1.13.2\n" + "**Discord Invite:** http://mhaprodigy.uk/discord\n"));
        let db = await keyv.get("guilds");
        // Start of the welcomer process. Everything else is handled in "handleMsg.js".
        if(!db) db = {};
        const {mhapGuild} = config.guilds;
        if(!db[mhapGuild]) db[mhapGuild] = {};
        if(!db[mhapGuild].welcomer) db[mhapGuild].welcomer = {};
        const msg = await u.send(config.embed("Roles - Poll (Stage 1)", "Would you like to be mentioned whenever we release a server poll?\nPlease reply with `yes` or `no`.", config.color.yellow));
        db[mhapGuild].welcomer[u.id] = msg.id;
        await keyv.set("guilds", db);
    }
});
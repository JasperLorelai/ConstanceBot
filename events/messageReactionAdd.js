const client = require("../bot");
const {config, keyv} = client;
client.on("messageReactionAdd", async (r, u) => {
    const {guild, channel, embeds} = r.message;

    if(guild && channel.parent && channel.parent.name === "Support Tickets" && !channel.name.includes("solved") && embeds && embeds.length && u.id !== client.user.id) {
        const ticket = embeds.find(e => e.title === "Problem:");
        if(ticket) {
            await r.users.remove(u.id);
            let pass = false;
            // Is creator.
            if(u.id === ticket.footer.text) pass = true;
            // Isn't creator but has mod perms?
            if(!pass) {
                const member = guild.members.resolve(u.id);
                if(member) pass = config.getPerms(member, "mod");
            }
            if(pass) {
                await channel.send(config.embed("Closed", "This support ticket was closed by: " + u.toString(), config.color.red));
                await channel.setName("solved-" + channel.name);
                await r.message.reactions.removeAll();
                await r.message.edit(ticket.fields.splice(1, 1));
                setTimeout(async () => {
                    // noinspection JSUnresolvedFunction
                    await channel.overwritePermissions({permissionOverwrites: [{id: guild.id, deny: "VIEW_CHANNEL"}]});
                }, 2000);
            }
        }
    }

    // Rule accept.
    if(r.message.id === config.messages.rules && r.emoji.toString() === "✅" && u.id !== client.user.id) {
        const member = await guild.members.resolve(u.id);
        if(member.roles.has(config.roles.verified)) return;
        // TODO: Remove comments.
        //await member.roles.remove(config.roles.unverified);
        //await member.roles.add(config.roles.verified);
        // TODO: Remove comment mid statement.
        await channel.send(config.embed("User " + u.username + " has accepted the rules!", u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + /*guild.roles.resolve(config.roles.verified).members.size + "/"*/ +guild.memberCount + "**."));
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
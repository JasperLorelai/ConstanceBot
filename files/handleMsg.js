module.exports = async message => {
    const {client, author, content, channel, guild, mentions} = message;
    const {config, keyv} = client;
    const main = config.getMainGuild();
    let db = await keyv.get("guilds");
    // DM Channel messages.
    if(!guild) {
        // Ignore bot.
        if(author.id === client.user.id) return;

        // Handle Welcomer for MHAP.
        if(db && db[config.guilds.mhapGuild] && db[config.guilds.mhapGuild].welcomer && db[config.guilds.mhapGuild].welcomer[author.id] && (content.toLowerCase().includes("yes") || content.toLowerCase().includes("no"))) {
            // TODO: Remove supression.
            // noinspection JSUnusedLocalSymbols
            function processRole(role) {
                if(content.toLowerCase().includes("yes")) {
                    // TODO: Remove comment.
                    //client.guilds.resolve(config.guilds.mhapGuild).members.resolve(author.id).roles.add(config.roles[role]);
                    embed.setColor(config.color.green).setDescription("Role added.");
                }
                else embed.setColor(config.color.red).setDescription("Role dismissed.");
            }

            const msg = await channel.messages.fetch(db[config.guilds.mhapGuild].welcomer[author.id]);
            const embed = config.getEmbed(msg);
            let newMsg;
            switch(embed.title) {
                case "Roles - Poll (Stage 1)":
                    processRole("polls");
                    newMsg = await channel.send(config.embed("Roles - Events (Stage 2)", "Would you like to be mentioned whenever a server event is hosted?\nPlease reply with `yes` or `no`.", config.color.yellow));
                    db[config.guilds.mhapGuild].welcomer[author.id] = newMsg.id;
                    break;
                case "Roles - Events (Stage 2)":
                    processRole("events");
                    newMsg = await channel.send(config.embed("Roles - Changelog (Stage 3)", "Would you like to be mentioned whenever a changelog for our server is posted?\nPlease reply with `yes` or `no`.", config.color.yellow));
                    db[config.guilds.mhapGuild].welcomer[author.id] = newMsg.id;
                    break;
                case "Roles - Changelog (Stage 3)":
                    processRole("changelog");
                    delete db[config.guilds.mhapGuild].welcomer[author.id];
                    break;
            }
            await msg.edit(embed);
            await keyv.set("guilds", db);
            return;
        }

        // Redirect messages to it's respective DM channel.
        // noinspection EqualityComparisonWithCoercionJS
        let dmchannel = main.channels.filter(c => c.name == author.id).array()[0];
        if(!dmchannel) {
            dmchannel = await main.channels.create(author.id, {
                topic: author.username,
                parent: config.categories.dmChannels
            });
        }
        const webhook = await dmchannel.createWebhook(author.username, {avatar: author.displayAvatarURL()});
        if(config.isJSON(content)) {
            const embed = JSON.parse(content);
            let final = {};
            if(!embed.embed) final.embeds = [embed]; else final.embeds = [embed.embed];
            await webhook.send("", final);
        }
        else await webhook.send(content);
        await webhook.delete();
        return;
    }
    // DM messages from the DM channels.
    // noinspection EqualityComparisonWithCoercionJS
    if(channel.parent && channel.parent.id == config.categories.dmChannels) {
        // noinspection EqualityComparisonWithCoercionJS
        if(channel.name == client.user.id) return;
        // Ignore webhooks - already redirected messages.
        if(message.webhookID) return;
        const user = client.users.resolve(channel.name);
        if(user) await user.send(config.isJSON(content) ? JSON.parse(content) : content); else {
            await channel.delete();
            config.botLog().send(author.toString(), config.embed("DM Channel Deleted", "User you tried to DM could not be found. (`" + channel.name + "`)", config.color.red));
        }
        return;
    }
    // Prefix query.
    if(mentions && mentions.users && mentions.users.has(client.user.id)) {
        await channel.send(config.embed("Guild Prefix", "My prefix is: **" + (db.prefix || config.globalPrefix) + "**"));
        return;
    }
    // Handle responses.
    if(db && guild && db[guild.id] && db[guild.id].responses) {
        for(let r of db[guild.id].responses) {
            let trigger = r.trigger;
            if(!/^\/.*\/[a-zA-Z]*$/g.test(trigger)) trigger = "/" + trigger + "/";
            const [ignore, regex, flags] = /\/(.*)\/([\w]*)/g.exec(trigger);
            if(!new RegExp(regex, flags).test(content)) continue;
            await channel.send(r.reply);
            return;
        }
    }
};
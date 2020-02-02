module.exports = async message => {
    const {client, author, content, channel, guild, mentions} = message;
    const {config, keyv} = client;
    const main = config.getMainGuild();
    let db = await keyv.get("guilds");
    // Ignore if it was handled externaly.
    if(message.deleted) return;
    // DM Channel messages.
    if(!guild) {
        // Ignore bot.
        if(author.id === client.user.id) return;

        // Handle Welcomer for MHAP.
        if(db && db[config.guilds.mhapGuild] && db[config.guilds.mhapGuild].welcomer && db[config.guilds.mhapGuild].welcomer[author.id] && (content.toLowerCase().includes("yes") || content.toLowerCase().includes("no"))) {
            function processRole(role) {
                if(content.toLowerCase().includes("yes")) {
                    client.guilds.resolve(config.guilds.mhapGuild).members.resolve(author.id).roles.add(config.roles[role]);
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
        let dmchannel = main.channels.filter(c => c.name === author.id).array()[0];
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

    // Handle To-Do in main guild.
    if(channel.id === config.channels.todolist) {
        if(author.id === client.user.id || author.bot) return;
        message.delete();
        const msg = await channel.send(new config.discord.MessageEmbed().setDescription(content).setColorRandom().setAuthor(author.tag, author.displayAvatarURL()));
        await msg.react("❌");
        await msg.react("✅");
        return;
    }

    // DM messages from the DM channels.
    if(channel.parent && channel.parent.id === config.categories.dmChannels) {
        if(channel.name === client.user.id) return;
        // Ignore webhooks - already redirected messages.
        if(message.webhookID) return;
        const user = client.users.resolve(channel.name);
        if(user) await user.send(config.isJSON(content) ? JSON.parse(content) : content); else {
            await channel.delete();
            config.botLog().send(author.toString(), config.embed("DM Channel Deleted", "User you tried to DM could not be found. (`" + channel.name + "`)", config.color.red));
        }
        return;
    }

    // Clean prefix query.
    if(mentions && mentions.users && mentions.users.has(client.user.id) && content.replace(config.discord.MessageMentions.USERS_PATTERN, "").trim() === "") {
        if(author.id === client.user.id) return;
        await channel.send(config.embed("Guild Prefix", "My prefix is: **" + (db && guild && db[guild.id] && db[guild.id].prefix ? db[guild.id].prefix : config.globalPrefix) + "**"));
        return;
    }

    // Handle raw forms.
    if(message.webhookID && message.webhookID === config.webhooks.mainRedirect) {
        let embed = config.getEmbed(message);
        const user = client.users.resolve(embed.title);
        const type = message.content;
        const guild = client.guilds.resolve(config.guilds.mhapGuild);

        async function handlePost(categoryTitle, channelName) {
            let postsCategory = categories.find(c => c.name.toLowerCase() === categoryTitle.toLowerCase());
            if(!postsCategory) {
                // noinspection JSCheckFunctionSignatures
                postsCategory = await guild.channels.create(categoryTitle, {type: "category", position: 9999, permissionOverwrites: config.getOverwrites("default", guild.id)});
            }
            const newPost = await guild.channels.create(channelName, {parent: postsCategory.id});
            await newPost.setPosition(0);
            const latestTicket = guild.channels.filter(c => c.parentID === postsCategory.id).find(c => c.position === 1);
            await newPost.setName(newPost.name + "-" + (latestTicket ? parseInt(latestTicket.name.substr(latestTicket.name.lastIndexOf("-") + 1)) + 1 : 1));
            return newPost;
        }

        const categories = guild.channels.filter(c => c.type === "category");
        let msg;
        switch(type) {
            case "rawSupportTicket":
                const ticket = await handlePost("Support Tickets", "ticket");
                msg = await ticket.send(config.embed("Problem:", embed.description).setAuthor(user.tag, user.displayAvatarURL()).addField("React Actions", "❌ - Close support ticket. (`Server Admin` or OP)").setFooter(user.id));
                await msg.react("❌");
                const restriction = embed.fields[0].value;
                if(restriction && restriction !== "EVERYONE!") {
                    await ticket.updateOverwrite(config.roles.verified, {VIEW_CHANNEL: false});
                    await ticket.updateOverwrite(user.id, {VIEW_CHANNEL: true});
                    if(restriction === "Staff only.") await ticket.updateOverwrite(config.roles.staff, {VIEW_CHANNEL: true});
                }
                break;
            case "rawSuggestion":
                const suggestion = await handlePost("Suggestions", "suggestion");
                msg = await suggestion.send(config.embed("They suggested:", embed.description).setAuthor(user.tag, user.displayAvatarURL()));
                await msg.react("👍");
                await msg.react("👎");
                await msg.react("✅");
                await msg.react("❌");
                break;
        }
        message.delete();
        return;
    }

    // Handle responses.
    if(db && guild && db[guild.id] && db[guild.id].responses) {
        if(author.id === client.user.id) return;
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
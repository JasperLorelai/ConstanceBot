module.exports = async message => {
    const {client, author, content, channel, guild, mentions} = message;
    const {config, util, keyv} = client;
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
            const embed = util.getEmbeds(msg)[0];
            let newMsg;
            switch(embed.title) {
                case "Roles - Poll (Stage 1)":
                    processRole("polls");
                    newMsg = await channel.send(util.embed("Roles - Events (Stage 2)", "Would you like to be mentioned whenever a server event is hosted?\nPlease reply with `yes` or `no`.", config.color.yellow));
                    db[config.guilds.mhapGuild].welcomer[author.id] = newMsg.id;
                    break;
                case "Roles - Events (Stage 2)":
                    processRole("events");
                    newMsg = await channel.send(util.embed("Roles - Changelog (Stage 3)", "Would you like to be mentioned whenever a changelog for our server is posted?\nPlease reply with `yes` or `no`.", config.color.yellow));
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
        let dmchannel = main.channels.cache.filter(c => c.name === author.id).array()[0];
        if(!dmchannel) {
            dmchannel = await main.channels.create(author.id, {
                topic: author.username,
                parent: config.categories.dmChannels
            });
        }
        const webhook = await dmchannel.createWebhook(author.username, {avatar: author.displayAvatarURL()});
        if(util.isJSON(content)) {
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
        await msg.react("🗑");
        return;
    }

    // DM messages from the DM channels.
    if(channel.parent && channel.parent.id === config.categories.dmChannels) {
        if(channel.name === client.user.id) return;
        // Ignore webhooks - already redirected messages.
        if(message.webhookID) return;
        const user = client.users.resolve(channel.name);
        if(user) await user.send(util.isJSON(content) ? JSON.parse(content) : content); else {
            await channel.delete();
            config.botLog().send(author.toString(), util.embed("DM Channel Deleted", "User you tried to DM could not be found. (`" + channel.name + "`)", config.color.red));
        }
        return;
    }

    // Message quoting.
    if(/https:\/\/.*?discordapp.com\/channels\//g.test(content)) {
        // Extract components of the url and search for them.
        let [msgGuild, msgChannel, msgID] = content.substring(content.indexOf("channels")+9).split("/");
        msgGuild = msgGuild ? client.guilds.resolve(msgGuild) : null;
        msgChannel = msgChannel ? msgGuild.channels.resolve(msgChannel) : null;
        msgID = msgID ? await msgChannel.messages.fetch(msgID) : null;
        // If the msg was truly found, quote it.
        if(msgID) {
            const embed = util.embed(null, msgID.content, config.color.yellow).setAuthor("Sent by: " + msgID.author.tag, msgID.author.displayAvatarURL());
            if(msgID.attachments.size) embed.attachFiles([{attachment: msgID.attachments.first().attachment, name: "image.png"}]).setImage("attachment://image.png");
            channel.send(embed.setTitle("Quoted by: " + author.tag));
        }
    }

    // Clean prefix query.
    if(mentions && mentions.users && mentions.users.has(client.user.id) && content.replace(config.discord.MessageMentions.USERS_PATTERN, "").trim() === "") {
        if(author.id === client.user.id) return;
        await channel.send(util.embed("Guild Prefix", "My prefix is: **" + (db && guild && db[guild.id] && db[guild.id].prefix ? db[guild.id].prefix : config.globalPrefix) + "**"));
        return;
    }

    // Handle raw forms.
    if(message.webhookID && message.webhookID === config.webhooks.mainRedirect) {
        let embed = util.getEmbeds(message)[0];
        const user = client.users.resolve(embed.title);
        const guild = client.guilds.resolve(config.guilds.mhapGuild);
        if(user) {
            const type = message.content;

            async function handlePost(categoryTitle, channelName, channelTopic) {
                let postsCategory = categories.find(c => c.name.toLowerCase() === categoryTitle.toLowerCase());
                if(!postsCategory) {
                    // noinspection JSCheckFunctionSignatures
                    postsCategory = await guild.channels.create(categoryTitle, {type: "category", permissionOverwrites: config.getOverwrites("mhapDefault", guild.id)});
                    await postsCategory.setPosition(client.channels.resolve(config.categories.olympus).position - 1);
                }
                const latestChannel = guild.channels.cache.filter(c => c.parentID === postsCategory.id).find(c => c.position === 0);
                channelName = channelName + "-" + (latestChannel ? (parseInt(latestChannel.name.substr(latestChannel.name.lastIndexOf("-") + 1)) + 1) : 1);
                const newChannel = await guild.channels.create(channelName, {permissionOverwrites: config.getOverwrites("mhapDefault", guild.id), parent: postsCategory.id, topic: channelTopic || ""});
                return await newChannel.setPosition(0);
            }

            const categories = guild.channels.cache.filter(c => c.type === "category");
            let msg;
            switch(type) {
                case "rawSupportTicket":
                    const ticket = await handlePost("Support Tickets", "ticket", "Need support? Open a support ticket here: http://mhaprodigy.uk/support");
                    msg = await ticket.send(util.embed("Problem:", embed.description).setAuthor(user.tag, user.displayAvatarURL()).addField("React Actions", "❌ - Close support ticket. (`Server Admin` or OP)").setFooter(user.id));
                    await msg.react("❌");
                    const restriction = embed.fields[0].value;
                    if(restriction && restriction !== "EVERYONE!") {
                        let permissions = [
                            {id: guild.id, deny: ["VIEW_CHANNEL"]},
                            {id: config.roles.muted, deny: ["SEND_MESSAGES"]},
                            {id: user.id, allow: ["VIEW_CHANNEL"]}
                        ];
                        if(restriction === "Staff only.") permissions.push({id: config.roles.staff, allow: ["VIEW_CHANNEL"]});
                        await ticket.overwritePermissions(permissions);
                    }
                    break;
                case "rawSuggestion":
                    const suggestion = await handlePost("Suggestions", "suggestion", "Would you like to suggest something? Open a suggestion here: http://mhaprodigy.uk/suggest");
                    msg = await suggestion.send(util.embed("They suggested:", embed.description).setAuthor(user.tag, user.displayAvatarURL()).addField("React Actions", "❌ - Deny suggestion. (`Server Admin` or OP)\n✅ - Accept suggestion. (`Server Admin` or OP)"));
                    await msg.react("👍");
                    await msg.react("👎");
                    await msg.react("✅");
                    await msg.react("❌");
                    break;
                case "rawStaffApp":
                    const appFragments = util.getEmbeds(message);
                    appFragments.shift();
                    const lastFragment = appFragments[appFragments.length -1];
                    appFragments.splice(appFragments.length-1);
                    const staffApp = await handlePost("Staff Applications", "staffapp", "Would you like to apply? Use this form here: http://mhaprodigy.uk/apply");
                    const firstFragment = await staffApp.send(new config.discord.MessageEmbed()
                        .setTitle("Staff Application")
                        .setColor(config.color.base)
                        .setThumbnail(user.displayAvatarURL())
                        .setDescription(embed.description)
                        .setAuthor("Issued by: " + user.tag)
                    );
                    for(const fragment of appFragments) await staffApp.send(new config.discord.MessageEmbed().setColor(config.color.base).setDescription(fragment.description));
                    msg = await staffApp.send(util.embed("", lastFragment.description).addField("Staff Application Actions", "❌ - Deny application. (`Server Admin`)\n✅ - Accept application. (`Server Admin`)"));
                    await msg.react("✅");
                    await msg.react("❌");
                    await firstFragment.pin();
                    break;
            }
        }
        else {
            util.log(guild, logEmbed => logEmbed.setColor(config.color.yellow)
                .setTitle("Form Submit Failed")
                .setDescription("A form failed to be submitted due to an invalid user ID.\n**Entered Value:** " + embed.title + "\n\n```" + embed.description + "```")
            );
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

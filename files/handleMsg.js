module.exports = async message => {
    const Client = message.client;
    const {author, content, channel, guild, mentions} = message;
    const {Config, Util, keyv} = Client;
    const main = Config.getMainGuild();
    let db = await keyv.get("guilds");
    // Ignore if it was handled externaly.
    if (message.deleted) return;
    // DM Channel messages.
    if (!guild) {
        // Ignore bot.
        if (author.id === Client.user.id) return;

        // Handle Welcomer for MHAP.
        const mhapGuild = Config.guildData.mhap;
        if (db && db[mhapGuild.id] && db[mhapGuild.id].welcomer && db[mhapGuild.id].welcomer[author.id] && (content.toLowerCase().includes("yes") || content.toLowerCase().includes("no"))) {
            function processRole(role) {
                if (content.toLowerCase().includes("yes")) {
                    Client.guilds.resolve(mhapGuild.id).members.resolve(author.id).roles.add(Config.roles[role]);
                    embed.setColor(Config.color.green).setDescription("Role added.");
                }
                else embed.setColor(Config.color.red).setDescription("Role dismissed.");
            }

            const msg = await channel.messages.fetch(db[mhapGuild.id].welcomer[author.id]);
            const embed = Util.getEmbeds(msg)[0];
            let newMsg;
            switch (embed.title) {
                case "Roles - Poll (Stage 1)":
                    processRole("polls");
                    newMsg = await channel.send(Util.embed("Roles - Events (Stage 2)", "Would you like to be mentioned whenever a server event is hosted?\nPlease reply with `yes` or `no`.", Config.color.yellow));
                    db[mhapGuild.id].welcomer[author.id] = newMsg.id;
                    break;
                case "Roles - Events (Stage 2)":
                    processRole("events");
                    newMsg = await channel.send(Util.embed("Roles - Changelog (Stage 3)", "Would you like to be mentioned whenever a changelog for our server is posted?\nPlease reply with `yes` or `no`.", Config.color.yellow));
                    db[mhapGuild.id].welcomer[author.id] = newMsg.id;
                    break;
                case "Roles - Changelog (Stage 3)":
                    processRole("changelog");
                    delete db[mhapGuild.id].welcomer[author.id];
                    break;
            }
            await msg.edit(embed);
            await keyv.set("guilds", db);
            return;
        }

        // Redirect messages to it's respective DM channel.
        let dmChannel = main.channels.cache.filter(c => c.name === author.id).array()[0];
        if (!dmChannel) {
            dmChannel = await main.channels.create(author.id, {
                topic: author.username,
                parent: Config.guildData.main.categories.dmChannels
            });
        }
        const webhook = await dmChannel.createWebhook(author.username, {avatar: author.displayAvatarURL()});
        if (Util.isJSON(content)) {
            const embed = JSON.parse(content);
            let final = {};
            if (!embed.embed) final.embeds = [embed]; else final.embeds = [embed.embed];
            await webhook.send("", final);
        }
        else await webhook.send(content);
        await webhook.delete({reason: "botIntent"});
        return;
    }

    // Handle Minecraft channels.
    if (author.id === Client.user.id) {
        if (content === "✅ The server is now online.") Client.minecraftChannels.push(channel.id);
        if (content === "❌ The server is now offline.") Client.minecraftChannels = Client.minecraftChannels.filter(e => e !== channel.id);
    }

    // Handle To-Do in main guild.
    if (channel.id === Config.guildData.main.channels.toDolist) {
        if (author.id === Client.user.id || author.bot) return;
        message.delete({reason: "botIntent"});
        const msg = await channel.send(new Config.Discord.MessageEmbed().setDescription(content).setColorRandom().setAuthor(author.tag, author.displayAvatarURL()));
        await msg.react("❌");
        await msg.react("✅");
        await msg.react("🗑");
        return;
    }

    // DM messages from the DM channels.
    if (channel.parent && channel.parent.id === Config.guildData.main.categories.dmChannels) {
        if (channel.name === Client.user.id) return;
        // Ignore webhooks - already redirected messages.
        if (message.webhookID) return;
        const user = Client.users.resolve(channel.name);
        if (user) await user.send(Util.isJSON(content) ? JSON.parse(content) : content); else {
            await channel.delete({reason: "botIntent"});
            Config.botLog().send(author.toString(), Util.embed("DM Channel Deleted", "User you tried to DM could not be found. (`" + channel.name + "`)", Config.color.red));
        }
        return;
    }

    // Message quoting.
    if (/https:\/\/.*?discord(app)?.com\/channels\//g.test(content)) {
        // Extract components of the url and search for them.
        let [msgGuild, msgChannel, msgID] = content.substring(content.indexOf("channels")+9).split("/");
        msgGuild = msgGuild ? Client.guilds.resolve(msgGuild) : null;
        msgChannel = msgChannel ? msgGuild.channels.resolve(msgChannel) : null;
        msgID = msgID ? await msgChannel.messages.fetch(msgID) : null;
        // If the msg was truly found, quote it.
        if (msgID) {
            const embed = Util.embed(null, msgID.content, Config.color.yellow).setAuthor("Sent by: " + msgID.author.tag, msgID.author.displayAvatarURL());
            embed.addField("Want to jump to the message?", "[\(Jump\)](" + msgID.url + ")");
            if (msgID.attachments.size) embed.attachFiles([{attachment: msgID.attachments.first().attachment, name: "image.png"}]).setImage("attachment://image.png");
            channel.send(embed.setTitle("Quoted by: " + author.tag));
        }
    }

    // Clean prefix query.
    if (mentions && mentions.users && mentions.users && mentions.users.has(Client.user.id) && content.replace(Config.Discord.MessageMentions.USERS_PATTERN, "").trim() === "") {
        if (author.id === Client.user.id) return;
        await channel.send(author.toString(), Util.embed("Guild Prefix", "My prefix is: **" + (db && guild && db[guild.id] && db[guild.id].prefix ? db[guild.id].prefix : Config.defaultPrefix) + "**"));
        return;
    }

    // Handle raw forms.
    if (message.webhookID && message.webhookID === Config.getWebhookID()) {
        let embed = Util.getEmbeds(message)[0];
        const user = Client.users.resolve(embed.title);
        const guildData = Config.guildData.mhap;
        const guild = Client.guilds.resolve(guildData.id);
        if (user) {
            const type = message.content;

            async function handlePost(categoryTitle, channelName, channelTopic) {
                let postsCategory = categories.find(c => c.name.toLowerCase() === categoryTitle.toLowerCase());
                if (!postsCategory) {
                    // noinspection JSCheckFunctionSignatures
                    postsCategory = await guild.channels.create(categoryTitle, {type: "category", permissionOverwrites: Config.getOverwrites("mhapDefault", guild.id)});
                    await postsCategory.setPosition(Client.channels.resolve(guildData.categories.olympus).position - 1);
                }
                const latestChannel = guild.channels.cache.filter(c => c.parentID === postsCategory.id).find(c => c.position === 0);
                channelName = channelName + "-" + (latestChannel ? (parseInt(latestChannel.name.substr(latestChannel.name.lastIndexOf("-") + 1)) + 1) : 1);
                const newChannel = await guild.channels.create(channelName, {permissionOverwrites: Config.getOverwrites("mhapDefault", guild.id), parent: postsCategory.id, topic: channelTopic || ""});
                return newChannel.setPosition(0);
            }

            const categories = guild.channels.cache.filter(c => c.type === "category");
            let msg;
            switch (type) {
                case "rawSupportTicket":
                    const ticket = await handlePost("Support Tickets", "ticket", "Need support? Open a support ticket here: " + Config.urls.mhap + "support");
                    msg = await ticket.send(Util.embed("Problem:", embed.description).setAuthor(user.tag, user.displayAvatarURL()).addField("React Actions", "❌ - Close support ticket. (`Server Admin` or OP)").setFooter(user.id));
                    await msg.react("❌");
                    const restriction = embed.fields[0].value;
                    if (restriction && restriction !== "EVERYONE!") {
                        let permissions = [
                            {id: guild.id, deny: ["VIEW_CHANNEL"]},
                            {id: guildData.roles.muted, deny: ["SEND_MESSAGES"]},
                            {id: user.id, allow: ["VIEW_CHANNEL"]}
                        ];
                        if (restriction === "Staff only.") permissions.push({id: guildData.roles.staff, allow: ["VIEW_CHANNEL"]});
                        await ticket.overwritePermissions(permissions);
                    }
                    break;
                case "rawSuggestion":
                    const suggestion = await handlePost("Suggestions", "suggestion", "Would you like to suggest something? Open a suggestion here: " + Config.urls.mhap + "suggest");
                    msg = await suggestion.send(Util.embed("They suggested:", embed.description).setAuthor(user.tag, user.displayAvatarURL()).addField("React Actions", "❌ - Deny suggestion. (`Server Admin` or OP)\n✅ - Accept suggestion. (`Server Admin` or OP)"));
                    await msg.react("👍");
                    await msg.react("👎");
                    await msg.react("✅");
                    await msg.react("❌");
                    break;
                case "rawStaffApp":
                    const appFragments = Util.getEmbeds(message);
                    appFragments.shift();
                    const lastFragment = appFragments[appFragments.length -1];
                    appFragments.splice(appFragments.length-1);
                    const staffApp = await handlePost("Staff Applications", "staffapp", "Would you like to apply? Use this form here: " + Config.urls.mhap + "apply");
                    const firstFragment = await staffApp.send(new Config.Discord.MessageEmbed()
                        .setTitle("Staff Application")
                        .setColor(Config.color.base)
                        .setThumbnail(user.displayAvatarURL())
                        .setDescription(embed.description)
                        .setAuthor("Issued by: " + user.tag)
                    );
                    for (const fragment of appFragments) await staffApp.send(new Config.Discord.MessageEmbed().setColor(Config.color.base).setDescription(fragment.description));
                    msg = await staffApp.send(Util.embed("", lastFragment.description).addField("Staff Application Actions", "❌ - Deny application. (`Server Admin`)\n✅ - Accept application. (`Server Admin`)"));
                    await msg.react("✅");
                    await msg.react("❌");
                    await firstFragment.pin();
                    break;
            }
        }
        else {
            Util.log(guild, logEmbed => logEmbed.setColor(Config.color.yellow)
                .setTitle("Form Submit Failed")
                .setDescription("A form failed to be submitted due to an invalid user ID.\n**Entered Value:** " + embed.title + "\n\n```" + embed.description + "```")
            );
        }
        message.delete({reason: "botIntent"});
        return;
    }

    // Handle responses.
    if (db && guild && db[guild.id] && db[guild.id].responses) {
        if (author.id === Client.user.id) return;
        for (let r of db[guild.id].responses) {
            let trigger = r.trigger;
            if (!/^\/.*\/[a-zA-Z]*$/g.test(trigger)) trigger = "/" + trigger + "/";
            const [ignore, regex, flags] = /\/(.*)\/([\w]*)/g.exec(trigger);
            if (!new RegExp(regex, flags).test(content)) continue;
            await channel.send(r.reply);
            return;
        }
    }
};

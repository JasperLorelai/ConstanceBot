module.exports = async message => {
    const {Config, Util, Keyv, Discord} = require("../Libs");
    const {MessageMentions, MessageEmbed} = Discord;
    const Client = message.client;
    const {author, content, channel, guild, mentions} = message;

    const main = Config.getMainGuild();
    let db = await Keyv.get("guilds");
    // Ignore if it was handled externaly.
    if (message.deleted) return;
    // DM Channel messages.
    if (!guild) {
        // Ignore bot.
        if (author.id === Client.user.id) return;

        // Redirect messages to it's respective DM channel.
        let dmChannel = main.channels.cache.filter(c => c.name === author.id).array()[0];
        if (!dmChannel) {
            dmChannel = await main.channels.create(author.id, {
                topic: author.username,
                parent: Config.guildData.main.categories.dmChannels
            });
        }
        const webhook = await dmChannel.createWebhook(author.username, {avatar: author.getAvatar()});
        if (content.isJSON()) {
            const embed = JSON.parse(content);
            let final = {};
            if (!embed.embed) final.embeds = [embed]; else final.embeds = [embed.embed];
            await webhook.send("", final);
        }
        else await webhook.send(content);
        await webhook.delete();
        return;
    }

    // Handle Minecraft channels.
    if (author.id === Client.user.id) {
        if (content === "✅ The server is now online.") Client.minecraftChannels.push(channel.id);
        if (content === "❌ The server is now offline.") Client.minecraftChannels = Client.minecraftChannels.filter(e => e !== channel.id);
    }

    // Handle To-Do in main guild.
    if (channel.id === Config.guildData.main.channels.toDoList) {
        if (author.id === Client.user.id || author.bot) return;
        message.delete();
        const msg = await channel.send(new MessageEmbed().setDescription(content).setColorRandom().setAuthor(author.tag).setAuthorIcon(author.getAvatar()));
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
        if (user) await user.send(content.isJSON() ? JSON.parse(content) : content); else {
            await channel.delete();
            Config.botLog().send(author.toString(), Util.embed("DM Channel Deleted", "User you tried to DM could not be found. (`" + channel.name + "`)", Config.color.red));
        }
        return;
    }

    // Message quoting.
    if (/https:\/\/.*?discord(app)?.com\/channels\//g.test(content)) {
        // Extract components of the url and search for them.
        let [msgGuildID, msgChannelID, msgID] = content.substring(content.indexOf("channels")+9).split("/");
        if (msgGuildID && msgChannelID && msgID) {
            const msgGuild = Client.guilds.resolve(msgGuildID);
            if (msgGuild) {
                const msgChannel = msgGuild.channels.resolve(msgChannelID);
                if (msgChannel) {
                    const msg = await msgChannel.messages.fetch(msgID).catch(() => {});
                    if (msg) {
                        const embed = Util.embed(null, msgID.content, Config.color.yellow).setAuthor("Sent by: " + msgID.author.tag).setAuthorIcon(msgID.author.getAvatar());
                        embed.addField("Want to jump to the message?", "[\(Jump\)](" + msgID.url + ")");
                        if (msgID.attachments.size) embed.setImagePermanent(msgID.attachments.first().attachment);
                        message.reply(embed.setTitle("Quoted by: " + author.tag));
                    }
                }
            }
        }
    }

    // Clean prefix query.
    if (mentions && mentions.users && mentions.users && mentions.users.has(Client.user.id) && content.replace(MessageMentions.USERS_PATTERN, "").trim() === "") {
        if (author.id === Client.user.id) return;
        await message.reply(Util.embed("Guild Prefix", "My prefix is: **" + (db && guild && db[guild.id] && db[guild.id].prefix ? db[guild.id].prefix : Config.defaultPrefix) + "**"));
        return;
    }

    // Handle raw forms.
    if (message.webhookID && message.webhookID === Config.getWebhookID()) {
        let embed = message.getFirstEmbed();
        const user = Client.users.resolve(embed.title);
        const guildData = Config.guildData.mhap;
        const guild = Client.guilds.resolve(guildData.id);
        if (user) {
            const type = message.content;

            async function handlePost(categoryTitle, channelName, channelTopic) {
                let postsCategory = categories.find(c => c.name.toLowerCase() === categoryTitle.toLowerCase());
                if (!postsCategory) {
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
                    const extraEmbed = Util.embed("Problem:", embed.description)
                        .setAuthor(user.tag)
                        .setAuthorIcon(user.getAvatar())
                        .addField("React Actions", "❌ - Close support ticket. (`Server Admin` or OP)")
                        .setFooterText(user.id);
                    msg = await ticket.send(extraEmbed);
                    await msg.react("❌");
                    const restriction = extraEmbed.fields[0].value;
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
                    msg = await suggestion.send(Util.embed("They suggested:", embed.description).setAuthor(user.tag).setAuthorIcon(user.getAvatar()).addField("React Actions", "❌ - Deny suggestion. (`Server Admin` or OP)\n✅ - Accept suggestion. (`Server Admin` or OP)"));
                    await msg.react("👍");
                    await msg.react("👎");
                    await msg.react("✅");
                    await msg.react("❌");
                    break;
                case "rawStaffApp":
                    const appFragments = message.getEmbeds();
                    const staffApp = await handlePost("Staff Applications", "staffapp", "Would you like to apply? Use this form here: " + Config.urls.mhap + "apply");

                    for (let i = 0; i < appFragments.length; i++) {
                        const fragment = appFragments[i];
                        const isLast = appFragments.length >= i + 1;
                        let embed = new MessageEmbed()
                            .setColor(Config.color.base)
                            .setDescription(fragment.description);

                        if (i === 0) {
                            // First fragment.
                            embed = embed.setTitle("Staff Application")
                                .setThumbnailPermanent(user.getAvatar())
                                .setAuthor("Issued by: " + user.tag);
                        }
                        if (isLast) {
                            // Last fragment.
                            embed = embed
                                .setFooterText(Util.getBaseFooter())
                                .setFooterIcon(Config.author.getAvatar())
                                .setTimestamp(new Date())
                                .addField("Staff Application Actions", "❌ - Deny application. (`Server Admin`)\n✅ - Accept application. (`Server Admin`)");
                        }

                        const msg = await staffApp.send(embed);
                        if (!isLast) continue;

                        await msg.react("✅");
                        await msg.react("❌");
                        await msg.pin();
                    }
                    break;
            }
        }
        else {
            Util.log(guild, logEmbed => logEmbed.setColor(Config.color.yellow)
                .setTitle("Form Submit Failed")
                .setDescription("A form failed to be submitted due to an invalid user ID.\n**Entered Value:** " + embed.title + "\n\n```" + embed.description + "```")
            );
        }
        await message.delete();
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
            await message.reply(r.reply);
            return;
        }
    }
};

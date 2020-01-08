module.exports = async message => {
    const {client, author, content, channel, guild, mentions} = message;
    const {config, keyv} = client;
    const main = config.getMainGuild();
    let db = await keyv.get("guilds");
    db = db ? db[guild.id] : {};
    // DM Channel messages.
    if(!guild) {
        // Ignore bot.
        if(author.id === client.user.id) return;

        // Redirect messages to it's respective DM channel.
        // noinspection EqualityComparisonWithCoercionJS
        let dmchannel = main.channels.filter(c => c.name == author.id).array()[0];
        if(!dmchannel) {
            dmchannel = await main.channels.create(author.id, {
                topic: author.username, parent: config.categories.dmChannels
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
    if(db.responses) {
        for(let r of db.responses) {
            let trigger = r.trigger;
            if(!/^\/.*\/[a-zA-Z]*$/g.test(trigger)) trigger = "/" + trigger + "/";
            const [ignore, regex, flags] = /\/(.*)\/([\w]*)/g.exec(trigger);
            if(!new RegExp(regex, flags).test(content)) continue;
            await channel.send(r.reply);
            return;
        }
    }
};
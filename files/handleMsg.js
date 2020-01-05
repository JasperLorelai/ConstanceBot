module.exports = async message => {
    const {client, author, content, channel, guild} = message;
    const {config, keyv} = client;
    const main = config.getMainGuild();
    let db = await keyv.get("guilds");
    if (!db) db = db[guild.id];
    // Redirect messages to it's respective DM channel.
    if (!message.guild) {
        if (author.id === client.user.id) return;
        // noinspection EqualityComparisonWithCoercionJS
        let channel = main.channels.filter(c => c.name == author.id).array()[0];
        if (!channel) channel = await main.channels.create(author.id, {
            topic: author.username,
            parent: config.categories.dmChannels
        });
        const webhook = await channel.createWebhook(author.username, {avatar: author.displayAvatarURL()});
        if (config.isJSON(content)) {
            const embed = JSON.parse(content);
            let final = {};
            if (!embed.embed) final.embeds = [embed];
            else final.embeds = [embed.embed];
            await webhook.send("", final);
        } else await webhook.send(content);
        await webhook.delete();
        return;
    }
    // DM messages from the DM channels.
    // noinspection EqualityComparisonWithCoercionJS
    if (message.channel.parent.id == config.categories.dmChannels) {
        // noinspection EqualityComparisonWithCoercionJS
        if (message.channel.name == client.user.id) return;
        const user = client.users.resolve(message.channel.name);
        if (user) await user.send(config.isJSON(content) ? JSON.parse(content) : content);
        else {
            await message.channel.delete();
            main.channels.resolve(config.channels.botLogs).send(author.toString(), config.embed("DM Channel Deleted", "User you tried to DM could not be found. (`" + message.channel.name + "`)", config.color.red));
        }
        return;
    }
    // Prefix query.
    if (message.mentions && message.mentions.users && message.mentions.users.has(client.user.id)) {
        await channel.send(config.embed("Guild Prefix", "My prefix is: **" + (db.prefix || config.globalPrefix) + "**"));
        return;
    }
    // Handle responses.
    if (db.responses) {
        for (let r of db.responses) {
            let trigger = r.trigger;
            if (!/^\/.*\/[a-zA-Z]*$/g.test(trigger)) trigger = "/" + trigger + "/";
            const [ignore, regex, flags] = /\/(.*)\/([\w]*)/g.exec(trigger);
            if (!new RegExp(regex, flags).test(content)) continue;
            await channel.send(r.reply);
            return;
        }
    }
};
module.exports = async message => {
    const {client, guild, author, content, channel} = message;
    const {config, keyv} = client;
    const main = config.getMainGuild(client);
    // Redirect messages to it's respective DM channel.
    if(!guild) {
        // noinspection EqualityComparisonWithCoercionJS
        if(channel.name == client.user.me) return;
        // noinspection EqualityComparisonWithCoercionJS
        let channel = main.channels.filter(c => c.name == author.id).array()[0];
        if(!channel) channel = await main.channels.create(author.id,{topic:author.username,parent:config.categories.dmChannels});
        const webhook = await channel.createWebhook(author.username, {avatar:author.displayAvatarURL()});
        if(config.isJSON(content)) {
            const embed = JSON.parse(content);
            let final = {};
            if(!embed.embed) final.embeds = [embed];
            else final.embeds = [embed.embed];
            await webhook.send("",final);
        }
        else await webhook.send(content);
        await webhook.delete();
        return;
    }
    // DM messages from the DM channels.
    // noinspection EqualityComparisonWithCoercionJS
    if(channel.parent == config.categories.dmChannels) {
        // noinspection EqualityComparisonWithCoercionJS
        if(channel.name == client.user.me) return;
        const user = client.users.resolve(channel.name);
        if(user) await user.send(config.isJSON(content) ? JSON.parse(content) : content);
        else {
            channel.delete();
            main.channels.resolve(config.channels.botLogs).send(author.toString(),config.embed(client,"DM Channel Deleted","User you tried to DM could not be found. (`" + channel.name + "`)","ff0000"));
        }
        return;
    }
    // Handle responses.
    for(let r of await keyv.get("responses." + guild.id) || []) {
        // Quite the effort to construct a regex from string.
        // TODO: Look into improvement.
        let regex = r.trigger;
        if(regex.match(/\/([a-zA-Z])/g)) regex = [regex.substr(1,regex.lastIndexOf("/")-1),regex.substr(regex.lastIndexOf("/")+1)];
        else regex = [regex,null];
        if(content.match(new RegExp(regex[0], regex[1]))) {
            await channel.send(r.reply);
            return;
        }
    }
};
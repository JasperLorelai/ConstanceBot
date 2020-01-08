const client = require("../bot");
client.on("messageUpdate", async (oldMessage, newMessage) => {
    const {config, keyv} = client;
    const {guild, author, content, channel} = oldMessage;
    // Check only if content changed.
    if(oldMessage.content === newMessage.content) return;

    if(author.id !== client.user.id && !author.bot) {
        config.log(guild, embed => embed.setColor(config.color.logs.messageUpdate)
            .setAuthor("@" + author.username + "#" + author.discriminator, author.displayAvatarURL())
            .setTitle("Message Edited")
            .setDescription(channel.toString() + " [\(Jump\)](" + oldMessage.url + ")")
            .addField("Before", content, false)
            .addField("Now", newMessage.content, false)
            .setFooter("Message ID: " + oldMessage.id));
    }

    let realprefix = null;
    let db = await keyv.get("guilds");
    if(guild && db && db[guild.id] && db[guild.id].prefix) realprefix = db[guild.id].prefix;
    if(!content.startsWith(config.globalPrefix)) {
        if(!guild) return;
        if(!(realprefix || content.startsWith(realprefix))) return;
    }
    if(!newMessage.content.startsWith(config.globalPrefix)) {
        if(!newMessage.guild) return;
        if(!(realprefix || newMessage.content.startsWith(realprefix))) return;
    }
    client.emit("message", newMessage);
});
const client = require("../bot");
client.on("messageUpdate", async (oldMessage, newMessage) => {
    // Ignore if the event was handled externally.
    if(newMessage.deleted) return;
    const {config, keyv} = client;
    const {guild, author, channel} = newMessage;
    // Check only if content changed.
    if(oldMessage && oldMessage.content === newMessage.content) return;

    if(author.id !== client.user.id && !author.bot &&
        // Handle blacklists.
        (channel["parentID"] && ![config.categories.olympus, config.categories.archive].includes(channel["parentID"])) &&
        ![config.channels.bot].includes(channel.id)
    ) {
        config.log(guild, embed => embed.setColor(config.color.logs.messageUpdate)
            .setAuthor("@" + author.username + "#" + author.discriminator, author.displayAvatarURL())
            .setTitle("Message Edited")
            .setDescription(channel.toString() + " [\(Jump\)](" + newMessage.url + ")")
            .addField("Before", oldMessage ? oldMessage.content : "Error: The old content wasn't recorded because it was from a previous session of the bot.", false)
            .addField("Now", newMessage.content, false)
            .setFooter("Message ID: " + newMessage.id));
    }

    // Ignore raw events.
    if(!oldMessage) return;

    let realprefix = null;
    let db = await keyv.get("guilds");
    if(guild && db && db[guild.id] && db[guild.id].prefix) realprefix = db[guild.id].prefix;
    if(!oldMessage.content.startsWith(config.globalPrefix)) {
        if(!guild) return;
        if(!(realprefix || oldMessage.content.startsWith(realprefix))) return;
    }
    if(!newMessage.content.startsWith(config.globalPrefix)) {
        if(!newMessage.guild) return;
        if(!(realprefix || newMessage.content.startsWith(realprefix))) return;
    }
    client.emit("message", newMessage);
});
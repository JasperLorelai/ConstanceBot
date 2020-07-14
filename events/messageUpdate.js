const client = require("../bot");
client.on("messageUpdate", async (oldMessage, newMessage) => {
    // Ignore if the event was handled externally.
    if (newMessage.deleted) return;
    const {config, util, keyv} = client;
    const {guild, author, channel} = newMessage;
    // Check only if content changed.
    if (oldMessage && oldMessage.content === newMessage.content) return;

    //const {main, nl} = config.channels;
    const nl = config.guildData.nl.channels;
    if (author.id !== client.user.id &&
        // Handle blacklists.
        (channel["parentID"] && ![config.guildData.mhap.categories.olympus, config.guildData.mhap.categories.archive].includes(channel["parentID"])) &&
        ![config.guildData.main.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        util.log(guild, embed => embed.setColor(config.color.logs.messageUpdate)
            .setAuthor("@" + author.tag, author.displayAvatarURL())
            .setTitle("Message Edited")
            .setDescription(channel.toString() + " [\(Jump\)](" + newMessage.url + ")")
            .addField("Before", oldMessage ? oldMessage.content : "Error: The old content wasn't recorded because it was from a previous session of the bot.", false)
            .addField("Now", newMessage.content, false)
            .setFooter("Message ID: " + newMessage.id));
    }

    // Ignore raw events.
    if (!oldMessage) return;

    let realprefix = null;
    let db = await keyv.get("guilds");
    if (guild && db && db[guild.id] && db[guild.id].prefix) realprefix = db[guild.id].prefix;
    if (!oldMessage.content.startsWith(config.defaultPrefix)) {
        if (!guild) return;
        if (!(realprefix || oldMessage.content.startsWith(realprefix))) return;
    }
    if (!newMessage.content.startsWith(config.defaultPrefix)) {
        if (!newMessage.guild) return;
        if (!(realprefix || newMessage.content.startsWith(realprefix))) return;
    }
    client.emit("message", newMessage);
});

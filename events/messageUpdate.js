const client = require("../bot");
client.on("messageUpdate", async (oldMessage, newMessage) => {
    // Ignore if the event was handled externally.
    if (newMessage.deleted) return;
    const {config, util, keyv} = client;
    const {guild, author, channel} = newMessage;
    // Check only if content changed.
    if (oldMessage && oldMessage.content === newMessage.content) return;

    const nl = config.guildData.nl.channels;
    if (// Handle blacklists.
        ![config.guildData.mhap.categories.olympus, config.guildData.mhap.categories.archive].includes(channel["parentID"]) &&
        ![config.guildData.main.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        let oldContent = oldMessage ? oldMessage.content : "Error: The old content wasn't recorded because it was from a previous session of the bot.";
        if (oldContent.length > 1024) oldContent = "Error: The old content is too long to display.";

        let newContent = newMessage.content || "No content.";
        if (newContent.length > 1024) newContent = "Error: The new content is too long to display.";

        util.log(guild, embed => embed.setColor(config.color.logs.messageUpdate)
            .setAuthor("@" + author.tag, author.displayAvatarURL())
            .setTitle("Message Edited")
            .setDescription(channel.toString() + " [\(Jump\)](" + newMessage.url + ")")
            .addField("Before", oldContent, false)
            .addField("Now", newContent, false)
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

const Client = require("../Client");
const Libs = require("../Libs");
const {Config, Util} = Libs;

Client.on("messageUpdate", async (oldMessage, newMessage) => {
    // FIXME Moving this here might not fix DB closed-state issues.
    const {Keyv} = Libs;

    // Ignore if the event was handled externally.
    if (newMessage.deleted) return;
    const {guild, author, channel} = newMessage;
    // Check only if content changed.
    if (oldMessage && oldMessage.content === newMessage.content) return;

    const nl = Config.guildData.nl.channels;
    if (// Handle blacklists.
        ![Config.guildData.mhap.categories.olympus, Config.guildData.mhap.categories.archive].includes(channel["parentID"]) &&
        ![Config.guildData.main.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        let oldContent = oldMessage ? oldMessage.content : "Error: The old content wasn't recorded because it was from a previous session of the bot.";
        if (oldContent.length > 1024) oldContent = "Error: The old content is too long to display.";

        let newContent = newMessage.content || "No content.";
        if (newContent.length > 1024) newContent = "Error: The new content is too long to display.";

        Util.log(guild, embed => embed.setColor(Config.color.logs.messageUpdate)
            .setAuthor("@" + author.tag)
            .setAuthorIcon(author.getAvatar())
            .setTitle("Message Edited")
            .setDescription(channel.toString() + " [\(Jump\)](" + newMessage.url + ")")
            .addField("Before", oldContent, false)
            .addField("Now", newContent, false)
            .setFooter("Message ID: " + newMessage.id));
    }

    // Ignore raw events.
    if (!oldMessage) return;

    let realprefix = null;
    let db = await Keyv.get("guilds");
    if (guild && db && db[guild.id] && db[guild.id].prefix) realprefix = db[guild.id].prefix;
    if (!oldMessage.content.startsWith(Config.defaultPrefix)) {
        if (!guild) return;
        if (!(realprefix || oldMessage.content.startsWith(realprefix))) return;
    }
    if (!newMessage.content.startsWith(Config.defaultPrefix)) {
        if (!newMessage.guild) return;
        if (!(realprefix || newMessage.content.startsWith(realprefix))) return;
    }
    Client.emit("message", newMessage);
});

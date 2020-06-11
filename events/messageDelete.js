const client = require("../bot");
client.on("messageDelete", async message => {
    const {config, util} = client;
    const {guild, author, channel} = message;
    const log = (await guild.fetchAuditLogs({type: "MESSAGE_DELETE"})).entries.first();

    const {channels, categories} = config;
    const {mhap} = categories;
    const {main, nl} = channels;
    if (log.reason !== "botIntent" &&
        // Handle blacklists.
        (channel["parentID"] && ![mhap.olympus, mhap.archive].includes(channel["parentID"])) &&
        ![main.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        util.log(guild, embed => {
            embed.setColor(config.color.logs.messageDelete)
                .setAuthor("@" + author.tag, author.displayAvatarURL())
                .setTitle("Message Deleted")
                .setDescription("**Deleted by** " + log.executor.toString() + " **in channel** " + channel.toString() + ".")
                .setFooter("Message ID: " + message.id);
            if (message.content) embed.addField("Content", message.content);
            if (message.attachments.size) embed.attachFiles([{attachment: message.attachments.first().attachment, name: "image.png"}]).setImage("attachment://image.png");
            return embed;
        });
    }
});

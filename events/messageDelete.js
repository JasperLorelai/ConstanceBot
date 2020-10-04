const client = require("../bot");
client.on("messageDelete", async message => {
    const {config, util} = client;
    const {guild, author, channel} = message;
    const log = (await guild.fetchAuditLogs({type: "MESSAGE_DELETE", limit: 1})).entries.first();

    const nl = config.guildData.nl.channels;
    if (log.reason !== "botIntent" &&

        // Handle blacklists.
        ![config.guildData.mhap.categories.olympus, config.guildData.mhap.categories.archive].includes(channel["parentID"]) &&
        ![config.guildData.main.channels.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        const executor = log.extra["channel"].id === message.channel.id
            && (log.target["id"] === message.author.id)
            && (log.createdTimestamp > (Date.now() - 5000))
            && (log.extra["count"] >= 1)
        ? log.executor : message.author;

        if (executor.id !== client.user.id) {
            util.log(guild, embed => {
                embed.setColor(config.color.logs.messageDelete)
                    .setAuthor("@" + author.tag, author.displayAvatarURL())
                    .setTitle("Message Deleted")
                    .setDescription("**Deleted by " + executor.toString() + "from channel** " + channel.toString() + ".")
                    .setFooter("Message ID: " + message.id)
                    .addField("Content", message.content ? message.content : "**No content.**");
                if (message.attachments.size) embed.attachFiles([{attachment: message.attachments.first().attachment, name: "image.png"}]).setImage("attachment://image.png");
                return embed;
            });
        }
    }
});

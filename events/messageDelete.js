const Client = require("../Client");
const {Config, Util} = require("../Libs");

Client.on("messageDelete", async message => {
    const {guild, author, channel} = message;
    if (!guild) return;
    const log = (await guild.fetchAuditLogs({type: "MESSAGE_DELETE", limit: 1})).entries.first();

    const nl = Config.guildData.nl.channels;
    if (!log) return;
    // Handle blacklists.
    if (![Config.guildData.mhap.categories.olympus, Config.guildData.mhap.categories.archive].includes(channel["parentID"]) &&
        ![Config.guildData.main.channels.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        const executor = log.extra["channel"].id === message.channel.id
            && (log.target["id"] === message.author.id)
            && (log.createdTimestamp > (Date.now() - 5000))
            && (log.extra["count"] >= 1)
        ? log.executor : message.author;

        if (executor.id === Client.user.id) return;
        Util.log(guild, embed => {
            embed.setColor(Config.color.logs.messageDelete)
                .setAuthor("@" + author.tag)
                .setAuthorIcon(author.getAvatar())
                .setTitle("Message Deleted")
                .setDescription("**Deleted by " + executor.toString() + " from channel** " + channel.toString() + ".")
                .setFooterText("Message ID: " + message.id)
                .addField("Content", message.content ? message.content : "**No content.**");
            if (message.attachments.size) embed = embed.setImagePermanent(message.attachments.first().attachment);
            return embed;
        });
    }
});

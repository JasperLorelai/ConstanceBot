const client = require("../bot");
client.on("messageDeleteUncached", async event => {
    const {config, util} = client;
    const guild = client.guilds.resolve(event["guild_id"]);
    const log = (await guild.fetchAuditLogs({type: "MESSAGE_DELETE"})).entries.first();
    const channel = log.extra["channel"];
    const author = log.target;

    const nl = config.guildData.nl.channels;
    if (log.reason !== "botIntent" &&
        // Handle blacklists.
        (channel["parentID"] && ![config.guildData.mhap.categories.olympus, config.guildData.mhap.categories.archive].includes(channel["parentID"])) &&
        ![config.guildData.main.channels.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        util.log(guild, embed => {
            return embed.setColor(config.color.logs.messageDelete)
                .setAuthor("@" + author["tag"], author.displayAvatarURL())
                .setTitle("Message Deleted")
                .setDescription("**Deleted by** " + log.executor.toString() + " **in channel** " + channel.toString() + ".")
                .setFooter("Message ID: " + log.id);
        });
    }
});

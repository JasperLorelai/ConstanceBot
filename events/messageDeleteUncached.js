const client = require("../bot");
client.on("messageDeleteUncached", async event => {
    const {config, util} = client;
    const guild = client.guilds.resolve(event["guild_id"]);
    const log = (await guild.fetchAuditLogs({type: "MESSAGE_DELETE"})).entries.first();
    const channel = log.extra["channel"];
    const author = log.target;

    const {channels, categories} = config;
    const {mhap} = categories;
    const {main, nl} = channels;
    if (log.reason !== "botIntent" &&
        // Handle blacklists.
        (channel["parentID"] && ![mhap.olympus, mhap.archive].includes(channel["parentID"])) &&
        ![main.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
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

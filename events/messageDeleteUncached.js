const client = require("../bot");
client.on("messageDeleteUncached", async event => {
    const {config, util} = client;
    const guild = client["guilds"].resolve(event["guild_id"]);
    const channelID = event["channel_id"];
    const messageID = event["id"];

    const nl = config.guildData.nl.channels;
    // Handle blacklists.
    if (![config.guildData.mhap.categories.olympus, config.guildData.mhap.categories.archive].includes(channel["parentID"]) &&
        ![config.guildData.main.channels.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        const channel = client["channels"].resolve(channelID);
        util.log(guild, embed => {
            embed = embed.setColor(config.color.logs.messageDelete)
                .setTitle("Message Deleted")
                .setDescription("**Uncached message deleted.**")
                .setFooter("Message ID: " + messageID);
            if (channel) embed = embed.setDescription(embed.description + "\n" + channel);
            else embed = embed.setFooter(embed.footer + " | Channel ID: " + channelID)
            return embed;
        });
    }
});

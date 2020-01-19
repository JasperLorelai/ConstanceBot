const client = require("../bot");
const {config} = client;
client.on("channelDelete", async channel => {
    // Ignore DM channels.
    if(channel.type === "dm") return;
    const {guild} = channel;

    const logs = await guild.fetchAuditLogs({type: "CHANNEL_DELETE"});
    const log = logs.entries.first();

    config.log(guild, embed => embed.setColor(config.color.logs.channelDelete)
        .setFooter("Channel ID: " + channel.id)
        .setTitle("Channel Deleted")
        .setDescription("**Name:** " + channel.name + "\n**Type: " + channel.type.toFormalCase() + (channel.parentID ? "\n**Parent ID:** " + channel.parentID : "") + "\n**By User:** " + log.executor.toString()));
});
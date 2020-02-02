const client = require("../bot");
const {config} = client;
client.on("channelDelete", async channel => {
    // Ignore DM channels.
    if(channel.type === "dm") return;
    const {guild, parent} = channel;

    const logs = await guild.fetchAuditLogs({type: "CHANNEL_DELETE"});
    const log = logs.entries.first();

    if(!["FormCategoryEmpty"].includes(log.reason)) {
        config.log(guild, embed => embed.setColor(config.color.logs.channelDelete)
            .setFooter("Channel ID: " + channel.id)
            .setTitle("Channel Deleted")
            .setDescription("**Name:** " + channel["name"] + "\n**Type:** " + channel.type.toFormalCase() + (channel["parentID"] ? "\n**Parent ID:** " + channel["parentID"] : "") + "\n**By User:** " + log.executor.toString() + (log.reason ? "\n**Reason:** " + log.reason : "")));
    }

    // If channel deleted was the last one in the form category, delete the category.
    if(parent) {
        if(guild.channels.filter(c => c.parent && c.parent.name === parent.name).size) return;
        // Category names.
        if(!["Suggestions", "Support Tickets"].includes(parent.name)) return;
        parent.delete("FormCategoryEmpty");
    }
});
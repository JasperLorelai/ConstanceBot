const Client = require("../Client");
const {Config, Util} = Client;
Client.on("channelDelete", async channel => {
    // Ignore DM channels.
    if (channel.type === "dm") return;
    const {guild, parent} = channel;
    const log = (await guild.fetchAuditLogs({type: "CHANNEL_DELETE"})).entries.first();

    if (!["FormCategoryEmpty"].includes(log.reason)) {
        Util.log(guild, embed => embed.setColor(Config.color.logs.channelDelete)
            .setTitle("Channel Deleted")
            .setFooter("Channel ID: " + channel.id)
            .setDescription("**Name:** `" + channel["name"] + "`\n**Type:** " + channel.type.toFormalCase() + (channel["parentID"] ? "\n**Parent ID:** `" + channel["parentID"] + "`" : "") + "\n**By User:** " + log.executor.toString() + (log.reason ? "\n**Reason:** " + log.reason : "")));
    }

    // If channel deleted was the last one in the form category, delete the category.
    if (parent) {
        if (guild.channels.cache.filter(c => c.parent && c.parent.name === parent.name).size) return;
        // Category names.
        if (!["Suggestions", "Support Tickets"].includes(parent.name)) return;
        parent.delete("FormCategoryEmpty");
    }
});

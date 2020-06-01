const client = require("../bot");
const {config} = client;
client.on("messageReactionRemove", async (r, u) => {
    const {guild} = r.message;
    // Ignore if the event was handled externally.
    if (r.message.deleted) return;

    // Role toggles.
    if (r.message.id === config.messages.nlnotify && r.emoji.toString() === "👋") {
        await guild.members.resolve(u.id).roles.remove(config.roles.notify);
    }
    if (config.messages.home && r.message.id === config.messages.home) {
        if (u.id === client.user.id) return;
        const member = await guild.members.resolve(u.id);
        switch (r.emoji.toString()) {
            case "🔞":
                member.roles.remove(config.roles.nsfw);
                break;
            case "📦":
                member.roles.remove(config.roles.polls);
                break;
            case "📆":
                member.roles.remove(config.roles.events);
                break;
            case "📰":
                member.roles.remove(config.roles.changelog);
                break;
        }
    }
});

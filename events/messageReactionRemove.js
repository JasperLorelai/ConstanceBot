const client = require("../bot");
const {config} = client;
client.on("messageReactionRemove", async (r, u) => {
    const {guild} = r.message;
    // Ignore if the event was handled externally.
    if (r.message.deleted) return;

    // Role toggles.
    if (r.message.id === config.messages.nl.notify && r.emoji.toString() === "👋") {
        await guild.members.resolve(u.id).roles.remove(config.roles.nl.notify);
    }
    if (r.message.id === config.messages.mhap.home) {
        if (u.id === client.user.id) return;
        const member = await guild.members.resolve(u.id);
        const roles = config.roles.mhap;
        switch (r.emoji.toString()) {
            case "🔞":
                member.roles.remove(roles.nsfw);
                break;
            case "📦":
                member.roles.remove(roles.polls);
                break;
            case "📆":
                member.roles.remove(roles.events);
                break;
            case "📰":
                member.roles.remove(roles.changelog);
                break;
        }
    }
});

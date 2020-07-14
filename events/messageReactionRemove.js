const client = require("../bot");
const {config} = client;
client.on("messageReactionRemove", async (r, u) => {
    // Ignore custom reactions.
    if (!r) return;

    const {guild} = r.message;
    // Ignore if the event was handled externally.
    if (r.message.deleted) return;

    // Per message handling.
    if (u.id === client.user.id) return;
    const mhapData = config.guildData.mhap;
    const nlData = config.guildData.nl;
    const member = await guild.members.resolve(u.id);
    switch (r.message.id) {
        // Role toggles (MHAP)
        case mhapData.messages.home:
            const roles = mhapData.roles;
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
            break;

        // Role toggles (Nl)
        case nlData.messages.notify:
            if (r.emoji.toString() !== "👋") return;
            await guild.members.resolve(u.id).roles.remove(nlData.roles.notify);
            break;
    }
});

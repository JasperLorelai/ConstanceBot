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
        case mhapData.messages.info:
            const roles = mhapData.roles;
            let role;
            switch (r.emoji.toString()) {
                case "🔞":
                    role = roles.nsfw;
                    break;
                case "📦":
                    role = roles.polls;
                    break;
                case "📆":
                    role = roles.events;
                    break;
                case "📰":
                    role = roles.changelog;
                    break;
            }
            if (!role) break;
            await member.roles.remove(role);
            break;

        // Role toggles (Nl)
        case nlData.messages.notify:
            if (r.emoji.toString() !== "👋") return;
            await guild.members.resolve(u.id).roles.remove(nlData.roles.notify);
            break;
    }
});

const Client = require("../Client");
const {Config} = require("../Libs");

Client.on("messageReactionRemove", async (r, u) => {
    // Ignore custom reactions.
    if (!r) return;

    const {guild} = r.message;
    // Ignore if the event was handled externally.
    if (r.message.deleted || !guild) return;

    // Per message handling.
    if (u.id === Client.user.id) return;
    const mhapData = Config.guildData.mhap;
    const nlData = Config.guildData.nl;
    const cctwcData = Config.guildData.cctwc;
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

        // Role toggle (CCTWC)
        case cctwcData.messages.info:
            if (r.emoji.toString() !== "📦") return;
            await guild.members.resolve(u.id).roles.remove(cctwcData.roles.polls);
            break;
    }
});

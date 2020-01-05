module.exports = {
    name: "serverinfo",
    description: "Displays information about the guild.",
    aliases: ["guildinfo"],
    guildOnly: true,
    async execute(message) {
        const {client, guild, channel} = message;
        const {config} = client;
        const {channels} = guild;
        const tc = channels.array().filter(c => c.type === "text");
        const vc = channels.array().filter(c => c.type === "voice");
        const desc = "**Name:** " + guild.name + " (" + guild.nameAcronym + ")" +
            "\n**Guild ID:** `" + guild.id + "`" +
            "\n**Created at:** " + guild.createdAt.toLocaleString() +
            "\n**Member count:** " + guild.memberCount +
            "\n**Guild owner:** " + guild.owner.toString() +
            "\n**Region:** " + guild.region +
            "\n**Default Message Notifications:** " + guild.defaultMessageNotifications.toFormalCase() +
            "\n**Moderation Verification Level:** " + guild.mfaLevel +
            (guild.features.length > 0 ? "\n**Features:** " + guild.features.map(f => "`" + f.toFormalCase() + "`").join(", ") : "") +
            (guild.premiumTier ? "\n**Boost Level:** Tier " + guild.premiumTier + " (boosts: " + guild.premiumSubscriptionCount + ")" : "") +
            (guild.verified ? "\n**Verified:** " + guild.verified : "") +
            (guild.partnered ? "\n**Partnered:** " + guild.partnered : "") +
            "\n**Text Channels (" + tc.length + "):** " + tc.join(", ") +
            "\n**Voice Channels (" + vc.length + "):** " + vc.join(", ");
        await channel.send(author.toString(), config.embed("Guild Info", desc).setThumbnail(guild.iconURL()));
    }
};

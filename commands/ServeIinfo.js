module.exports = {
    name: "serverinfo",
    description: "Displays information about the guild.",
    aliases: ["guildinfo"],
    guildOnly: true,
    async execute(Libs, message) {
        const {Util} = Libs;
        const {guild, channel, author} = message;

        try {
            const channels = guild.channels.cache.array();
            const tc = channels.filter(c => c.type === "text");
            const vc = channels.filter(c => c.type === "voice");
            const verificationLevels = {
                NONE: "None",
                LOW: "Low",
                MEDIUM: "Medium",
                HIGH: "(╯°□°）╯︵ ┻━┻",
                VERY_HIGH: "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻",
            };
            const desc = "**Name:** " + guild.name + " `(" + guild.nameAcronym + ")`" +
                "\n**Guild ID:** `" + guild.id + "`" +
                "\n**Max members:** " + (await guild.fetch()).maximumMembers +
                "\n**Created at:** `" + guild.createdAt.toLocalFormat() + "`" +
                "\n**Member count:** " + guild.memberCount +
                "\n**Guild owner:** " + guild.owner.toString() +
                "\n**Region:** `" + guild.region + "`" +
                "\n**Default Message Notifications:** " + guild.defaultMessageNotifications.toFormalCase() +
                "\n**Moderation Verification Level:** " + verificationLevels[guild.verificationLevel] +
                "\n**Explicit Content Filter (Scan media from):** " + guild.explicitContentFilter.replace(/_/g, " ").toFormalCase() +
                (guild.features.length > 0 ? "\n**Features:** " + guild.features.map(f => "`" + f.toFormalCase() + "`").join(", ") : "") +
                (guild.premiumTier ? "\n**Boost Level:** Tier " + guild.premiumTier + " (boosts: " + guild.premiumSubscriptionCount + ")" : "") +
                (guild.verified ? "\n**Verified:** " + guild.verified : "") +
                (guild.partnered ? "\n**Partnered:** " + guild.partnered : "") +
                (guild.vanityURLCode ? "\n**Vanity URL:** `" + guild.vanityURLCode + "`" : "") +
                (tc.length ? "\n**Text Channels:** " + tc.length : "") +
                (vc.length ? "\n**Voice Channels:** " + vc.length : "");
            await channel.send(author.toString(), Util.embed("Guild Info", desc).setThumbnailPermanent(guild.iconURL()));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

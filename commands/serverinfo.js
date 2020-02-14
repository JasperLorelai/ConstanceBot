module.exports = {
    name: "serverinfo",
    description: "Displays information about the guild.",
    aliases: ["guildinfo"],
    guildOnly: true,
    async execute(message) {
        const {client, guild, channel, author} = message;
        const {util} = client;
        const channels = guild.channels.cache.cache.array();
        const tc = channels.filter(c => c.type === "text");
        const vc = channels.filter(c => c.type === "voice");
        // This might need to be updated whenever a new one is added. Alternatively,
        // if it has to be, look into accessing the original array from
        // discord.js: https://github.com/discordjs/discord.js/blob/master/src/util/Constants.js
        const verificationLevels = [
            "None",
            "Low",
            "Medium",
            "(╯°□°）╯︵ ┻━┻",
            "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻",
        ];
        const desc = "**Name:** " + guild.name + " (" + guild.nameAcronym + ")" + "\n**Guild ID:** `" + guild.id + "`" + "\n**Created at:** `" + guild.createdAt.toLocaleString() + "`" + "\n**Member count:** " + guild.memberCount + "\n**Guild owner:** " + guild.owner.toString() + "\n**Region:** " + guild.region + "\n**Default Message Notifications:** " + guild.defaultMessageNotifications.toFormalCase() + "\n**Moderation Verification Level:** " + verificationLevels[guild.verificationLevel] + (guild.features.length > 0 ? "\n**Features:** " + guild.features.map(f => "`" + f.toFormalCase() + "`").join(", ") : "") + (guild.premiumTier ? "\n**Boost Level:** Tier " + guild.premiumTier + " (boosts: " + guild.premiumSubscriptionCount + ")" : "") + (guild.verified ? "\n**Verified:** " + guild.verified : "") + (guild.partnered ? "\n**Partnered:** " + guild.partnered : "") + (tc.length ? "\n**Text Channels:** " + tc.length : "") + (vc.length ? "\n**Voice Channels:** " + vc.length : "");
        await channel.send(author.toString(), util.embed("Guild Info", desc).setThumbnail(guild.iconURL()));
    }
};

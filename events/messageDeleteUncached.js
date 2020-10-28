const Client = require("../Client");
const {Config, Util} = require("../Libs");

Client.on("messageDeleteUncached", async event => {

    const guild = Client.guilds.resolve(event["guild_id"]);
    const channel = guild.channels.resolve(event["channel_id"]);
    const messageID = event["id"];

    const nl = Config.guildData.nl.channels;
    // Handle blacklists.
    if (![Config.guildData.mhap.categories.olympus, Config.guildData.mhap.categories.archive, Config.guildData.cctwc.categories.staff].includes(channel.parentID) &&
        ![Config.guildData.main.channels.bot, nl.triumvirate, nl.leadership, nl.interview2, nl.interview].includes(channel.id)
    ) {
        Util.log(guild, embed => {
            embed = embed.setColor(Config.color.logs.messageDelete)
                .setTitle("Message Deleted")
                .setDescription("**Uncached message deleted.**")
                .setFooter("Message ID: " + messageID);
            if (channel) embed = embed.setDescription(embed.description + "\n" + channel.toString());
            else embed = embed.setFooter(embed.footer + " | Channel ID: " + channel.id)
            return embed;
        });
    }
});

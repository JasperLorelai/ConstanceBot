module.exports = {
    name: "getinvite",
    description: "Fetches the Discord invite.",
    guildOnly: true,
    async execute(message) {
        const {guild, client} = message;
        const {config, util} = client;
        let invite;
        switch (guild.id) {
            case config.guilds.mhapGuild:
                invite = "http://mhaprodigy.uk/discord";
                break;
            case config.guilds.nlGuild:
                invite = "https://discord.gg/Z9R4j7g";
                break;
            default:
                await message.channel.send(message.author.toString(), util.embed("Invite Fetch", "No saved invite was configured for this guild.", config.color.red));
                return;
        }
        await message.channel.send(message.author.toString() + "\n" + invite);
    }
};

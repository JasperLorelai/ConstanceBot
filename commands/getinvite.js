module.exports = {
    name: "getinvite",
    description: "Fetches the Discord invite.",
    guildOnly: true,
    async execute(message) {
        const {guild, client} = message;
        const {config, util} = client;
        const data = config.getGuildData(guild.id);
        let invite;
        if (data) invite = data.invite;
        else {
            await message.channel.send(message.author.toString(), util.embed("Invite Fetch", "No saved invite was configured for this guild.", config.color.red));
            return;
        }
        await message.channel.send(message.author.toString() + "\n" + invite);
    }
};

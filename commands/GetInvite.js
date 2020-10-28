module.exports = {
    name: "getinvite",
    description: "Fetches the Discord invite.",
    guildOnly: true,
    async execute(message) {
        const {Config, Util} = message.client;
        const data = Config.getGuildData(message.guild.id);
        let invite;
        if (data) invite = data.invite;
        else {
            await message.channel.send(message.author.toString(), Util.embed("Invite Fetch", "No saved invite was configured for this guild.", Config.color.red));
            return;
        }
        await message.channel.send(message.author.toString() + "\n" + invite);
    }
};

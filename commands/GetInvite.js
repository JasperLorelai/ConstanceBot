module.exports = {
    name: "getinvite",
    description: "Fetches the Discord invite.",
    guildOnly: true,
    async execute(Libs, message) {
        const {Config, ConditionException} = Libs;

        const data = Config.getGuildData(message.guild.id);
        let invite;
        if (data) invite = data.invite;
        else throw new ConditionException(message.author, "Invite Fetch", "No saved invite was configured for this guild.");
        await message.reply(invite);
    }
};

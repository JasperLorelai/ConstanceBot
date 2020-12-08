module.exports = {
    name: "updateinfo",
    description: "Update the main embed of a guild.",
    guildOnly: true,
    perm: "author",
    async execute(Libs, message) {
        const {Util, Config, ConditionException} = Libs;
        const {channel, author, guild} = message;

        const data = Config.getGuildData(guild.id);
        if (!data) throw new ConditionException(author, "Info Updater", "There is no guild data defined for this guild.");
        const infoChannelID = data.channels.info;
        if (!infoChannelID) throw new ConditionException(author, "Info Updater", "This guild has no info channel defined in its data.");
        const infoChannel = guild.channels.resolve(infoChannelID);
        if (!infoChannel) throw new ConditionException(author, "Info Updater", "The info channel defined for this guild does not exist in this guild.");
        let infoMsgID = data.messages.info;
        if (!infoMsgID) {
            infoMsgID = (await infoChannel.send("Setting up info...")).id;
            Config.botLog().send(Config.author.toString() +", guild `" + guild.id + "` **" + guild.name + "** just created an Info message. Please add its ID to its configuration.");
        }
        const infoMsg = await infoChannel.messages.fetch(infoMsgID);
        if (!infoMsg) throw new ConditionException(author, "Info Updater", "The defined info message was not found in the info channel.");
        const infoData = data.info;
        if (!infoData) throw new ConditionException(author, "Info Updater", "This guild has no info message defined.");
        const infoText = infoData.getText();

        // Check if embeds are similar.
        let embed = infoMsg.getFirstEmbed();
        if (embed && embed.description === infoText.description && embed.fields === infoText.fields) {
            throw new ConditionException(author, "Info Updater", "Nothing was updated.");
        }

        await infoMsg.edit("", infoText);
        for (const r of infoData.reactions) {
            await infoMsg.react(r);
        }

        channel.send(author.toString(), Util.embed("Info Updater", "Info was updated."));
    }
};

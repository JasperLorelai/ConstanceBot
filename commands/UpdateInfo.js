const {Util, Config} = require("../Libs");

module.exports = {
    name: "updateinfo",
    description: "Update the main embed of a guild.",
    guildOnly: true,
    perm: "author",
    async execute(message) {
        const {channel, author, guild} = message;
        const Client = message.client;

        try {
            function exit(code) {
                channel.send(author.toString(), Util.embed("Info Updater", "Info was not set up for this guild. (code: " + code + ")", Config.color.red));
            }

            const data = Config.getGuildData(guild.id);
            if (!data) {
                exit("`no guild data`");
                return;
            }

            const infoChannelID = data.channels.info;
            if (!infoChannelID) {
                exit("`no info channel in config`");
                return;
            }

            const infoChannel = guild.channels.resolve(infoChannelID);
            if (!infoChannel) {
                exit("`no info channel`");
                return;
            }

            let infoMsgID = data.messages.info;
            if (!infoMsgID) {
                infoMsgID = (await infoChannel.send("Setting up info...")).id;
                Config.botLog().send(Client.author.toString() +", guild `" + guild.id + "` **" + guild.name + "** just created an Info message. Please add its ID to its configuration.");
            }

            const infoMsg = await infoChannel.messages.fetch(infoMsgID);
            if (!infoMsg) {
                exit("`no info message`");
                return;
            }

            const infoData = data.info;
            if (!infoData) {
                exit("`no info data`");
                return;
            }

            const infoText = infoData.getText();

            // Check if embeds are similar.
            let embed = infoMsg.getEmbeds();
            if (embed) {
                embed = embed[0];
                if (embed.description === infoText.description && embed.fields === infoText.fields) {
                    exit("`no change`");
                    return;
                }
            }

            await infoMsg.edit("", infoText);
            for (const r of infoData.reactions) {
                await infoMsg.react(r);
            }

            channel.send(author.toString(), Util.embed("Info Updater", "Info was updated."));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

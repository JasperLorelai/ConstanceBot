module.exports = {
    name: "copy",
    description: "Copy a message, including rich embeds, to another channel.",
    params: ["[origin channel ID]", "[message ID]", "[new channel ID]"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Config, Util, ConditionException} = Libs;
        const {author} = message;
        const Client = message.client;

        const originChannel = Client.channels.resolve(args[0]);
        if (!originChannel) throw new ConditionException(author, "Message Copy", "Origin channel not found. Confirm the channel with this ID exists and is visible to the bot client.");
        const copyMsg = await originChannel.messages.fetch(args[1]).catch(() => {
            message.reply(Util.embed("Message Copy", "Message with that ID was not found in channel " + originChannel.toString() + ".", Config.color.red));
        });
        if (!copyMsg) return;
        const archive = Client.channels.resolve(args[2]);
        if (!archive) throw new ConditionException(author, "Message Copy", "Specified channel where the fetched message should be copied to was not found. Confirm the channel with this ID exists and is visible to the bot client.");
        const wb = await archive.createWebhook(copyMsg.author.username, {avatar: copyMsg.author.getAvatar(), reason: "Message Copy - initiated by " + author.username + "(" + author.id + ")"});
        const newMsg = await wb.send(copyMsg);
        await wb.delete();
        message.reply(Util.embed("", "Message copied. [\(Jump\)](" + newMsg.url + ")"));
    }
};

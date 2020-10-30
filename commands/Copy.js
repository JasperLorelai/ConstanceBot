module.exports = {
    name: "copy",
    description: "Copy a message, including rich embeds, to another channel.",
    params: ["[origin channel ID]", "[message ID]", "[new channel ID]"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message, args) {
        const {Config, Util} = Libs;
        const {channel, author} = message;
        const Client = message.client;

        const originChannel = Client.channels.resolve(args[0]);
        if (!originChannel) {
            channel.send(author.toString(), Util.embed("Message Copy", "Origin channel not found. Confirm the channel with this ID exists and is visible to the bot client.", Config.color.red));
            return;
        }
        const copyMsg = await originChannel.messages.fetch(args[1]).catch(() => {
            channel.send(author.toString(), Util.embed("Message Copy", "Message with that ID was not found in channel " + originChannel.toString() + ".", Config.color.red));
        });
        if (!copyMsg) return;
        const archive = Client.channels.resolve(args[2]);
        if (!archive) {
            channel.send(author.toString(), Util.embed("Message Copy", "Specified channel where the fetched message should be copied to was not found. Confirm the channel with this ID exists and is visible to the bot client.", Config.color.red));
            return;
        }
        const wb = await archive.createWebhook(copyMsg.author.username, {avatar: copyMsg.author.displayAvatarURL(), reason: "Message Copy - initiated by " + author.username + "(" + author.id + ")"});
        const newMsg = await wb.send(copyMsg);
        await wb.delete({reason: "botIntent"});
        channel.send(author.toString(), Util.embed("", "Message copied. [\(Jump\)](" + newMsg.url + ")"));
    }
};

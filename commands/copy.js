module.exports = {
    name: "copy",
    description: "Copy a message, including rich embeds, to another channel.",
    params: ["[origin channel ID]", "[message ID]", "[new channel ID]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, channel, author} = message;
        const {config, util} = client;
        const originChannel = client.channels.resolve(args[0]);
        if(!originChannel) {
            channel.send(author.toString(), util.embed("Message Copy", "Origin channel not found. Confirm the channel with this ID exists and is visible to the bot client.", config.color.red));
            return;
        }
        const copyMsg = await originChannel.messages.fetch(args[1]).catch(() => {
            channel.send(author.toString(), util.embed("Message Copy", "Message with that ID was not found in channel " + originChannel.toString() + ".", config.color.red));
        });
        if(!copyMsg) return;
        const archive = client.channels.resolve(args[2]);
        if(!archive) {
            channel.send(author.toString(), util.embed("Message Copy", "Specified channel where the fetched message should be copied to was not found. Confirm the channel with this ID exists and is visible to the bot client.", config.color.red));
            return;
        }
        const wb = await channel.createWebhook(copyMsg.author.username, {avatar: copyMsg.author.displayAvatarURL(), reason: "Message Copy - initiated by " + author.username + "(" + author.id + ")"});
        const newMsg = await wb.send(copyMsg);
        channel.send(author.toString(), util.embed("", "Message copied. [\(Jump\)](" + newMsg.url + ")"));
        await wb.delete();
    }
};

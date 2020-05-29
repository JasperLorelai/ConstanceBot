module.exports = {
    name: "edit",
    description: "Edit a message as long as it was sent by this client user.",
    params: ["[origin channel ID]", "[message ID] [content/embed object]"],
    guildOnly: true,
    perm: "author",
    async execute(message, args) {
        const {client, channel, author} = message;
        const {config, util} = client;
        try {
            const originChannel = client.channels.resolve(args[0]);
            if (!originChannel) {
                channel.send(author.toString(), util.embed("Message Edit", "Origin channel not found. Confirm the channel with this ID exists and is visible to the bot client.", config.color.red));
                return;
            }
            args.shift();
            const editMsg = await originChannel.messages.fetch(args[0]).catch(() => {
                channel.send(author.toString(), util.embed("Message Edit", "Message with that ID was not found in channel " + originChannel.toString() + ".", config.color.red));
            });
            if (!editMsg) return;
            args.shift();
            let msg = args.join(" ");
            if (msg.startsWith("`") && msg.endsWith("`")) msg = msg.replace(/`/g, "");
            msg = util.isJSON(msg) ? JSON.parse(msg) : msg;
            await editMsg.edit(msg);
            channel.send(author.toString(), util.embed("", "Message edited. [\(Jump\)](" + editMsg.url + ")"));
            message.delete();
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

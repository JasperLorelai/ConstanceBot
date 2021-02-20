module.exports = {
    name: "edit",
    description: "Edit a message as long as it was sent by this client user.",
    params: ["[origin channel ID]", "[message ID] [content/embed object]"],
    guildOnly: true,
    perm: "author",
    async execute(Libs, message, args) {
        const {Config, Util, ConditionException} = Libs;
        const {author} = message;
        const Client = message.client;

        const originChannel = Client.channels.resolve(args[0]);
        if (!originChannel) throw new ConditionException(author, "Message Edit", "Origin channel not found. Confirm the channel with this ID exists and is visible to the bot client.");
        await args.shift();
        const editMsg = await originChannel.messages.fetch(args[0]).catch(() => {
            message.reply(Util.embed("Message Edit", "Message with that ID was not found in channel " + originChannel.toString() + ".", Config.color.red));
        });
        if (!editMsg) return;
        await args.shift();
        let msg = args.join(" ");
        if (msg.startsWith("`") && msg.endsWith("`")) msg = msg.replace(/`/g, "");
        msg = msg.isJSON() ? JSON.parse(msg) : msg;
        await editMsg.edit(msg);
        message.reply(Util.embed("", "Message edited. [\(Jump\)](" + editMsg.url + ")"));
    }
};

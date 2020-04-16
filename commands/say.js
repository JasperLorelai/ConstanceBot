module.exports = {
    name: "say",
    description: "Send messages as the bot account. Channel id is optional. The message can be an embed object.",
    guildOnly: true,
    params: ["(channel id)", "[message]"],
    perm: "author",
    async execute(message, args) {
        const {client, channel} = message;
        const {util} = client;
        // Check if the first argument is a channel id and set it as target.
        let ch = client.channels.resolve(args[0]);
        if (ch) args.shift();
        // If not, assume the target channel to be the source channel.
        else ch = channel;
        let msg = args.join(" ");
        if (msg.startsWith("`") && msg.endsWith("`")) msg = msg.replace(/`/g, "");
        msg = util.isJSON(msg) ? JSON.parse(msg) : msg;
        await ch.send(msg);
        await message.delete();
    }
};

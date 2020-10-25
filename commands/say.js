module.exports = {
    name: "say",
    description: "Send messages as the bot account. Channel id is optional. The message can be an embed object.",
    guildOnly: true,
    params: ["(channel id)", "[message]"],
    perm: "author",
    async execute(message, args) {
        const Client = message.client;
        const {Util} = Client;
        try {
            // Check if the first argument is a channel id and set it as target.
            let channel = Client.channels.resolve(args[0]);
            if (channel) args.shift();
            // If not, assume the target channel to be the source channel.
            else channel = message.channel;
            let msg = args.join(" ");
            if (msg.startsWith("`") && msg.endsWith("`")) msg = msg.replace(/`/g, "");
            msg = Util.isJSON(msg) ? JSON.parse(msg) : msg;
            await channel.send(msg);
            await message.delete({reason: "botIntent"});
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

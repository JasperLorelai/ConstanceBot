module.exports = {
    name: "say",
    description: "Send messages as the bot account. Channel id is optional. The message can be an embed object.",
    guildOnly: true,
    params: ["(channel id)", "[message]"],
    perm: "author",
    async execute(Libs, message, args) {
        const Client = message.client;

        // Check if the first argument is a channel id and set it as target.
        let channel = Client.channels.resolve(args[0]);
        if (channel) await args.shift();
        // If not, assume the target channel to be the source channel.
        else channel = message.channel;
        let msg = args.join(" ");
        if (msg.startsWith("`") && msg.endsWith("`")) msg = msg.replace(/`/g, "");
        msg = msg.isJSON() ? JSON.parse(msg) : msg;
        await channel.send(msg);
        await message.delete();
    }
};

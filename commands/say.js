module.exports = {
    name: "say",
    description: "Send messages as the bot account. Channel id is optional. The message can be an embed object.",
    guildOnly: true,
    params: ["(channel id)","[message]"],
    perm: "author",
    async execute(message, args) {
        const fun = require("../files/config");
        // Check if the first argument is a channel id and set it as target.
        let channel = message.client.channels.resolve(args[0]);
        if(channel) args.shift();
        // If not, assume the target channel to be the source channel.
        else channel = message.channel;
        let msg = args.join(" ");
        // Check if message is an embed. Otherwise check if its a coded embed.
        msg = fun.isJSON(msg) ? JSON.parse(msg) : (fun.isJSON(msg.replace(/`/g,"")) ? JSON.parse(msg.replace(/`/g,"")) : msg);
        await channel.send(msg);
        await message.delete();
    },
};
module.exports = {
    name: "say",
    description: "Send messages as the bot account.",
    guildOnly: true,
    params: ["[message]"],
    perm: "author",
    async execute(message, args) {
        await message.channel.send(args.join(" "));
        await message.delete();
    },
};
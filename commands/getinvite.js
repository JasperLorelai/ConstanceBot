module.exports = {
    name: "getinvite",
    description: "Fetches the Discord invite.",
    guildOnly: true,
    async execute(message) {
        await message.channel.send(message.author.toString() + "\nhttp://mhaprodigy.uk/discord");
    }
};

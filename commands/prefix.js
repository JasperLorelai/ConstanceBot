module.exports = {
    name: "prefix",
    description: "Change command prefix of this server.",
    guildOnly: true,
    params: ["[prefix]"],
    perm: "admin",
    async execute(message, args) {
        const {client, channel, guild} = message;
        await client.keyv.set("prefix." + guild.id, args[0]);
        await channel.send(client.config.embed(client, "Command Prefix", "**Prefix set to:** " + args[0], null));
    },
};
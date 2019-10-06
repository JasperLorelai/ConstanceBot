module.exports = {
    name: "prefix",
    description: "Change command prefix of this server.",
    guildOnly: true,
    params: ["[prefix]"],
    perm: "admin",
    async execute(message, args) {
        const fun = require("../files/config");
        await message.client.keyv.set("prefix." + message.guild.id, args[0]);
        await message.channel.send(fun.embed(message.client, "Command Prefix", "**Prefix set to:** " + args[0], null));
    },
};
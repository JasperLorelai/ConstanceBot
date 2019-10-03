module.exports = {
    name: "prefix",
    description: "Change command prefix of this server.",
    guildOnly: true,
    params: ["[prefix]"],
    perm: "admin",
    async execute(message, args) {
        const fun = require(process.env.INIT_CWD + "\\files\\config.js");
        await message.client.keyv.set("prefix." + message.guild.id, args[0]);
        message.channel.send(fun.embed(message.client, "Command Prefix", "**Prefix set to:** " + args[0], null)).then(async m => {
            await m.delete({timeout: this.ttl * 1000});
            await message.delete({timeout: this.ttl * 1000});
        });
    },
};
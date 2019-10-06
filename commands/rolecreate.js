module.exports = {
    name: "rolecreate",
    description: "Creates a new role.",
    aliases: ["createrole","rcreate"],
    params: ["[name]"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const fun = require("../files/config");
        const role = await message.guild.roles.create({data:{name:args.join(" ")}});
        message.channel.send(fun.embed(message.client,"Role Creator","**Created role:** " + args.join(" "))).then(async msg => {
            await fun.handleChange(msg, message.author, role, role => role.delete(),null, {denied:"Role deleted!",accepted:"Role created!",newTitle:""});
        });
    }
};
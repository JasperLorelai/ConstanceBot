module.exports = {
    name: "roledelte",
    description: "Delete a role.",
    aliases: ["roledel","delrole","drole"],
    params: ["[required]","(optional)"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const fun = require("../files/config");
        const role = fun.findRole(args.join(" "), message.guild);
        if (!role) {
            await message.channel.send(fun.embed(message.client, "Role Deleter", "Role could not be found.", "ff0000"));
            return null;
        }
        await message.channel.send(fun.embed(message.client,"Role Deleter","Role **" + role.name + "** was successfully deleted."));
        role.delete();
    }
};
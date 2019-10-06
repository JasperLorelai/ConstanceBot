module.exports = {
    name: "roleinfo",
    description: "Displays information about a guild role.",
    aliases: ["rinfo"],
    params: ["[role]"],
    guildOnly: true,
    async execute(message, args) {
        const fun = require("../files/config");
        let role = fun.findRole(args.join(" "), message.guild);
        if(!role) {
            await message.channel.send(fun.embed(message.client,"Role Info", "Role not found!", "ff0000"));
            return;
        }
        const desc = "**Role Position:** " + role.position +
            "\n**Name:** " + role.name +
            "\n**ID:** `<@&" + role.id + ">`" +
            "\n**Members:** " + role.members.map(m => m.user.tag).length +
            "\n**Created at:** " + role.createdAt.toLocaleString() +
            "\n**Hoistable:** " + role.hoist +
            "\n**Mentionable:** " + role.mentionable +
            "\n**Menitoned:** " + role.toString() +
            "\n**Color:** " + role.hexColor;
        await message.channel.send(fun.embed(message.client, "Role information of input: `" + args.join(" ") + "`", desc));
    }
};
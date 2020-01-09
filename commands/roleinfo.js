module.exports = {
    name: "roleinfo",
    description: "Displays information about a guild role.",
    aliases: ["rinfo"],
    params: ["[role]"],
    guildOnly: true,
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config} = client;
        let role = config.findRole(args.join(" "), guild);
        if(!role) {
            await channel.send(author.toString(), config.embed("Role Info", "Role not found!", config.color.red));
            return;
        }
        const desc = "**Role Position:** " + role.position + "\n**Name:** " + role.name + "\n**ID:** `<@&" + role.id + ">`" + "\n**Members:** " + role.members.map(m => m.user.tag).length + "\n**Created at:** " + role.createdAt.toLocaleString() + "\n**Hoistable:** " + role.hoist + "\n**Mentionable:** " + role.mentionable + "\n**Menitoned:** " + role.toString() + "\n**Color:** `" + role.hexColor + "`";
        const canvas = client.canvas.createCanvas(64, 64);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = role.hexColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await channel.send(author.toString(), config.embed("Role information of input: `" + args.join(" ") + "`", desc).attachFiles([{
            attachment: canvas.toBuffer(), name: "bg.png"
        }]).setThumbnail("attachment://bg.png"));
    }
};
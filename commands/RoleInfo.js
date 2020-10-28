const {Config, Util, canvas} = require("../Libs");

module.exports = {
    name: "roleinfo",
    description: "Displays information about a guild role.",
    aliases: ["rinfo"],
    params: ["[role]"],
    guildOnly: true,
    async execute(message, args) {
        const {guild, channel, author} = message;

        try {
            let role = Util.findRole(args.join(" "), guild);
            if (!role) {
                await channel.send(author.toString(), Util.embed("Role Info", "Role not found!", Config.color.red));
                return;
            }
            const desc = "**Role Position:** " + role.position + "\n**Name:** " + role.name + "\n**ID:** `<@&" + role.id + ">`" + "\n**Members:** " + role.members.map(m => m.user.tag).length + "\n**Created at:** " + role.createdAt.toLocalFormat() + "\n**Hoistable:** " + role.hoist + "\n**Mentionable:** " + role.mentionable + "\n**Menitoned:** " + role.toString() + "\n**Color:** `" + role.hexColor + "`";
            const canvas = canvas.createCanvas(64, 64);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = role.hexColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await channel.send(author.toString(), Util.embed("Role information of input: `" + args.join(" ") + "`", desc).setThumbnailPermanent(canvas.toBuffer()));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

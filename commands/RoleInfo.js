module.exports = {
    name: "roleinfo",
    description: "Displays information about a guild role.",
    aliases: ["rinfo"],
    params: ["[role]"],
    guildOnly: true,
    async execute(Libs, message, args) {
        const {Util, Canvas, ConditionException} = Libs;
        const {guild, channel, author} = message;

        let role = Util.findRole(args.join(" "), guild);
        if (!role) throw new ConditionException(author, "Role Info", "Role not found!");
        const desc = "> **Role Position:** " + role.position +
            "\n> **Menitoned:** " + role.toString() +
            "\n> **ID:** `" + role.toString() + "`" +
            "\n> **Name:** " + role.name +
            "\n> **Members:** " + role.members.map(m => m.user.tag).length +
            "\n> **Created at:** " + role.createdAt.toLocalFormat() +
            "\n> **Mentionable:** " + role.mentionable +
            "\n> **Hoistable:** " + role.hoist +
            "\n> **Color:** `" + role.hexColor + "`";
        const canvas = Canvas.createCanvas(64, 64);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = role.hexColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await channel.send(author.toString(), Util.embed("Role information of input: `" + args.join(" ") + "`", desc).setThumbnailPermanent(canvas.toBuffer()));
    }
};

module.exports = {
    name: "roleinfo",
    description: "Displays information about a guild role.",
    aliases: ["rinfo"],
    params: ["[role]"],
    guildOnly: true,
    async execute(Libs, message, args) {
        const {Util, Canvas, ConditionException} = Libs;
        const {guild} = message;

        let role = Util.findRole(args.join(" "), guild);
        if (!role) throw new ConditionException(message, "Role Info", "Role not found!");
        const {tags} = role;
        const desc = "> **Role Position:** " + role.position +
            "\n> **Menitoned:** " + role.toString() +
            "\n> **ID:** `" + role.toString() + "`" +
            "\n> **Name:** " + role.name +
            "\n> **Members:** " + role.members.map(m => m.user.tag).length +
            "\n> **Created at:** " + role.createdAt.toLocalFormat() +
            "\n> **Mentionable:** " + role.mentionable +
            "\n> **Hoistable:** " + role.hoist +
            "\n> **Color:** `" + role.hexColor + "`" +
            (tags ? (
                (tags.botID ? "\n> **Belongs to bot:** <@" + tags.botID + ">" : "") +
                (tags.integrationID ? "\n> **Belongs to integration:** `" + tags.integrationID + "`" : "") +
                (tags.premiumSubscriberRole ? "\n> **Is booster role:** `true`" : "")
            ) : "");
        const canvas = Canvas.createCanvas(64, 64);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = role.hexColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await message.reply(Util.embed("Role information of input: `" + args.join(" ") + "`", desc).setThumbnailPermanent(canvas.toBuffer()));
    }
};

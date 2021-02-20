module.exports = {
    name: "role",
    description: "Toggle user's roles. The `roles` parameter could be one role or a list of roles separated by a comma.",
    params: ["[user]", "[roles]"],
    guildOnly: true,
    perm: "admin",
    async execute(Libs, message, args) {
        const {Util, ConditionException} = Libs;
        const {guild} = message;

        const member = Util.findGuildMember(args.shift(), guild);
        if (!member) throw new ConditionException(message, "Role Management", "User not found!");
        if (!member.manageable) throw new ConditionException(message, "Role Management", "User is lower in the permission hierarchy than the bot!");
        let text = "Log:";
        let role;
        for (let r of args.join(" ").split(",").map(r => r.trim())) {
            role = Util.findRole(r, guild);
            if (!role) {
                text += "\n**`?`** `" + r + "` not found";
                continue;
            }
            if (role.managed) {
                text += "\n**`?`** " + role.toString() + " managed externally";
                continue;
            }
            const compare = Util.getRoleByPerm(member, "MANAGE_ROLES");
            if (compare && role.comparePositionTo(compare) > 0) {
                text += "\n**`?`** " + role.toString() + " was higher in the permission hierarchy";
                continue;
            }
            if (member.roles.cache.has(role.id)) {
                text += "\n**`-`** " + role.toString();
                await member.roles.remove(role);
            }
            else {
                text += "\n**`+`** " + role.toString();
                member.roles.add(role);
            }
        }
        await message.reply(Util.embed("Role Management", text));
    }
};

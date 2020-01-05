module.exports = {
    name: "role",
    description: "Toggle user's roles. The `roles` parameter could be one role or a list of roles seperated by a comma.",
    params: ["[user]", "[roles]"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config} = client;
        const {red} = config.color;
        const member = config.findGuildMember(args.shift(), guild);
        if(!member) {
            await channel.send(config.embed("Role Management", "User not found!", red));
            return;
        }
        if(!member.manageable) {
            await channel.send(author.toString(), config.embed("Role Management", "User is lower in the permission hierarchy than the bot!", red));
            return;
        }
        let text = "Log:";
        let role;
        for(let r of args.join(" ").split(",").map(r => r.trim())) {
            role = config.findRole(r, guild);
            if(!role) {
                text += "\n**`?`** `" + r + "` not found";
                continue;
            }
            if(role.managed) {
                text += "\n**`?`** " + role.toString() + " managed externally";
                continue;
            }
            const compare = config.getRoleByPerm(member, "MANAGE_ROLES");
            if(compare && role.comparePositionTo(compare) > 0) {
                text += "\n**`?`** " + role.toString() + " was higher in the permission hierarchy";
                continue;
            }
            if(member.roles.has(role.id)) {
                text += "\n**`-`** " + role.toString();
                member.roles.remove(role);
            }
            else {
                text += "\n**`+`** " + role.toString();
                member.roles.add(role);
            }
        }
        await channel.send(author.toString(), config.embed("Role Management", text));
    }
};
module.exports = {
    name: "role",
    description: "Toggle user's roles. The `roles` parameter could be one role or a list of roles seperated by a comma.",
    params: ["[user]","[roles]"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const fun = require("../files/config");
        const member = fun.findGuildMember(args.shift(), message.guild);
        if(!member) {
            await message.channel.send(fun.embed(message.client,"Role Management","User not found!","ff0000"));
            return;
        }
        if(!member.manageable) {
            await message.channel.send(fun.embed(message.client,"Role Management","User is lower in the permission hierarchy than the bot!","ff0000"));
            return;
        }
        let text = "Log:";
        let role;
        for(let r of args.join(" ").split(",").map(r => r.trim())) {
            role = fun.findRole(r,message.guild);
            if(!role) {
                text += "\n**`?`** `" + r + "` not found";
                continue;
            }
            if(role.managed) {
                text += "\n**`?`** " + role.toString() + " managed externally";
                continue;
            }
            const compare = fun.getRoleByPerm(member, "MANAGE_ROLES");
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
        await message.channel.send(fun.embed(message.client,"Role Management",text));
    }
};
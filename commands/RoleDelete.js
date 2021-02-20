module.exports = {
    name: "roledelete",
    description: "Delete a role.",
    aliases: ["roledel", "delrole", "drole"],
    params: ["[role]"],
    guildOnly: true,
    perm: "admin",
    async execute(Libs, message, args) {
        const {Util, ConditionException} = Libs;
        const role = Util.findRole(args.join(" "), message.guild);
        if (!role) throw new ConditionException(message, "Role Deleter", "Role could not be found.");
        await message.reply(Util.embed("Role Deleter", "Role **" + role.name + "** was successfully deleted."));
        role.delete();
    }
};

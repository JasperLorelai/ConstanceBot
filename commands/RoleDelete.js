module.exports = {
    name: "roledelete",
    description: "Delete a role.",
    aliases: ["roledel", "delrole", "drole"],
    params: ["[role]"],
    guildOnly: true,
    perm: "admin",
    async execute(Libs, message, args) {
        const {Util, ConditionException} = Libs;
        const {guild, channel, author} = message;

        const role = Util.findRole(args.join(" "), guild);
        if (!role) throw new ConditionException(author, "Role Deleter", "Role could not be found.");
        await channel.send(author.toString(), Util.embed("Role Deleter", "Role **" + role.name + "** was successfully deleted."));
        role.delete();
    }
};

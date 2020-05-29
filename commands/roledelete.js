module.exports = {
    name: "roledelete",
    description: "Delete a role.",
    aliases: ["roledel", "delrole", "drole"],
    params: ["[role]"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config, util} = client;
        try {
            const role = util.findRole(args.join(" "), guild);
            if (!role) {
                await channel.send(author.toString(), util.embed("Role Deleter", "Role could not be found.", config.color.red));
                return null;
            }
            await channel.send(author.toString(), util.embed("Role Deleter", "Role **" + role.name + "** was successfully deleted."));
            role.delete();
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

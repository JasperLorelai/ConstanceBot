const {Config, Util} = require("../Libs");

module.exports = {
    name: "roledelete",
    description: "Delete a role.",
    aliases: ["roledel", "delrole", "drole"],
    params: ["[role]"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const {guild, channel, author} = message;

        try {
            const role = Util.findRole(args.join(" "), guild);
            if (!role) {
                await channel.send(author.toString(), Util.embed("Role Deleter", "Role could not be found.", Config.color.red));
                return null;
            }
            await channel.send(author.toString(), Util.embed("Role Deleter", "Role **" + role.name + "** was successfully deleted."));
            role.delete();
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

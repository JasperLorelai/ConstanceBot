module.exports = {
    name: "members",
    description: "Lists of all guild members of a role.",
    guildOnly: true,
    params: ["[role]"],
    async execute(Libs, message, args) {
        const {Config, Util} = Libs;
        const {guild, channel, author} = message;

        try {
            const role = Util.findRole(args[0], guild);
            if (!role) {
                await channel.send(author.toString(), Util.embed("Role Members", "Role not found!", Config.color.red));
                return;
            }
            const membersWithRole = guild.members.cache.filter(m => m.roles.cache.has(role.id));
            const text = "**Members** (**" + membersWithRole.size + "**)**:** " + membersWithRole.map(m => "<@" + m.id + ">").join(", ");
            const msg = await channel.send(author.toString(), Util.embed("Role Members: " + role.name, (text.length >= 2000 ? "" : text)));
            if (text.length >= 2000) await Util.handlePrompt(msg, text);
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

module.exports = {
    name: "members",
    description: "Lists of all guild members of a role.",
    guildOnly: true,
    params: ["[role]"],
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config, util} = client;
        const role = util.findRole(args[0], guild);
        if (!role) {
            await channel.send(author.toString(), util.embed("Role Members", "Role not found!", config.color.red));
            return;
        }
        const text = guild.members.cache.filter(m => m.roles.cache.has(role.id)).map(m => "<@" + m.id + ">").join(", ");
        const msg = await channel.send(author.toString(), util.embed("Role Members: " + role.name, (text.length >= 2000 ? "" : text)));
        if (text.length >= 2000) await util.handlePrompt(msg, text);
    }
};

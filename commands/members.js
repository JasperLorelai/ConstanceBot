module.exports = {
    name: "members",
    description: "Lists of all guild members of a role.",
    guildOnly: true,
    params: ["[role]"],
    async execute(message, args) {
        const {client, guild, channel} = message;
        const {config} = client;
        const role = config.findRole(args[0],guild);
        if(!role) {
            await channel.send(config.embed(client,"Role Members","Role not found!","ff0000"));
            return;
        }
        const text = guild.members.filter(m => m.roles.has(role.id)).map(m => "<@" + m.id + ">").join(", ");
        const msg = await channel.send(config.embed(client, "Role Members: " + role.name, (text.length >= 2048 ? "" : text)));
        if(text.length >= 2048) await config.handlePrompt(msg, text);
    }
};
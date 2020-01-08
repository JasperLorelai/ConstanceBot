module.exports = {
    name: "rolecreate",
    description: "Creates a new role.",
    aliases: ["createrole", "rcreate"],
    params: ["[name]"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config} = client;
        const role = await guild.roles.create({data: {name: args.join(" ")}});
        channel.send(author.toString(), config.embed("Role Creator", "**Created role:** " + args.join(" "))).then(async msg => {
            await config.handleChange(msg, author, role, role => role.delete(), null, {
                denied: "Role deleted!", accepted: "Role created!", newTitle: ""
            });
        });
    }
};
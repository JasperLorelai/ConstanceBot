module.exports = {
    name: "roledelte",
    description: "Delete a role.",
    aliases: ["roledel","delrole","drole"],
    params: ["[required]","(optional)"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const {client, guild, channel} = message;
        const {config} = client;
        const role = config.findRole(args.join(" "), guild);
        if (!role) {
            await channel.send(config.embed(client, "Role Deleter", "Role could not be found.", "ff0000"));
            return null;
        }
        await channel.send(config.embed(client,"Role Deleter","Role **" + role.name + "** was successfully deleted."));
        role.delete();
    }
};
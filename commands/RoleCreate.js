module.exports = {
    name: "rolecreate",
    description: "Creates a new role.",
    aliases: ["createrole", "rcreate"],
    params: ["[name]"],
    guildOnly: true,
    perm: "admin",
    async execute(Libs, message, args) {
        const {Util} = Libs;
        const {guild, author} = message;

        const role = await guild.roles.create({data: {name: args.join(" ")}});
        const msg = await message.reply(Util.embed("Role Creator", "**Created role:** " + args.join(" ")))
        await Util.handleChange(msg, author, role, role => role.delete(), null, {denied: "Role deleted!", accepted: "Role created!", newTitle: ""});
    }
};

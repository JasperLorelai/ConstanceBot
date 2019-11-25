module.exports = {
    name: "setnick",
    description: "Change a user's nickname.",
    aliases: ["nick"],
    params: ["[user]","[new nick]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, channel, guild} = message;
        const config = client.config;
        const member = config.findGuildMember(args.shift(), guild);
        if(!member) {
            await channel.send(config.embed("Set Nick", "User not found in this guild!", config.color.red));
            return null;
        }
        await member.setNickname(args.join(" "));
        await channel.send(config.embed("Set Nick","Nick for user " + member.toString() + " was changed to: **" + args.join(" ") + "**"));
    }
};
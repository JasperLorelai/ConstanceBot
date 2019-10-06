module.exports = {
    name: "setnick",
    description: "Change a user's nickname.",
    aliases: ["nick"],
    params: ["[user]","[new nick]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const fun = require("../files/config");
        const member = fun.findGuildMember(args.shift(), message.guild);
        if(!member) {
            await message.channel.send(fun.embed(message.client, "Set Nick", "User not found in this guild!", "ff0000"));
            return null;
        }
        await member.setNickname(args.join(" "));
        await message.channel.send(fun.embed(message.client,"Set Nick","Nick for user " + member.toString() + " was changed to: **" + args.join(" ") + "**"));
    }
};
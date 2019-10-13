module.exports = {
    name: "kick",
    description: "Kick a guild member out of the guild. They will still be able to rejoin using an invite.",
    params: ["[user]","(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const fun = require("../files/config");
        let member = fun.findGuildMember(args[0], message.guild);
        if (!member) {
            await message.channel.send(fun.embed(message.client, "Kick Member", "User not found.", "ff0000"));
            return;
        }
        if (!member.kickable) {
            await message.channel.send(fun.embed(message.client, "Kick Member", "Cannot modify that user.", "ff0000"));
            return;
        }
        args.shift();
        await message.channel.send(fun.embed(message.client,"Kicked Member","**" + member.user.username + "** has been kicked from the server by user: " + message.author.toString() + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
        await member.kick(member.user.username + " has been kicked from the server by user: " + message.author.username + (args[0] ? "\nFor reason: " + args.join(" ") : ""));
        message.delete();
        await fun.modlogs.add("kick", message.guild.id, message.client.keyv, member.id, message.author.id, (args[0] ? args.join(" ") : null));
    }
};
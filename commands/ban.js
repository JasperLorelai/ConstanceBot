module.exports = {
    name: "ban",
    description: "Ban a guild member.",
    params: ["[user]","(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config} = client;
        let member = config.findGuildMember(args[0], guild);
        if (!member) {
            await channel.send(config.embed(client, "Ban Member", "User not found.", "ff0000"));
            return;
        }
        if (!member.bannable) {
            await channel.send(config.embed(client, "Ban Member", "Cannot modify that user.", "ff0000"));
            return;
        }
        const msg = await channel.send(config.embed(client,"Ban Member", "Purge messages of how many days?"));
        await msg.react("");
        const coll = msg.createReactionCollector((r,u) => u.id !== msg.client.user.id, {time:10000});
        coll.on("collect", async (r,u) => {
            await r.users.remove(u);
            if(u.id !== author.id) return null;
            let days = -1;
            switch (r.emoji.toString()) {
                case "0":
                    days = 0;
                    break;
                case "1":
                    days = 1;
                    break;
            }
            if(days > 0) return null;
            args.shift();
            await channel.send(config.embed(client,"Banned Member","**" + member.user.username + "** has been banned from the server by user: " + author.toString() + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
            await member.ban({days:days, reason:member.user.username + " has been banned from the server by user: " + author.username + (args[0] ? "\nFor reason: " + args.join(" ") : "")});
            message.delete();
            await config.modlogs.add("ban", guild, member.id, author.id, (args[0] ? args.join(" ") : null));
        });
        coll.on("end", async () => {
            await msg.delete();
        });
    }
};
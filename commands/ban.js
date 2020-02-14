module.exports = {
    name: "ban",
    description: "Ban a guild member.",
    params: ["[user]", "(reason)"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {client, guild, channel, author} = message;
        const {config, util, emojiFile} = client;
        const {red} = config.color;
        let member = util.findGuildMember(args[0], guild);
        if(!member) {
            await channel.send(author.toString(), util.embed("Ban Member", "User not found.", red));
            return;
        }
        if(!member.bannable) {
            await channel.send(author.toString(), util.embed("Ban Member", "Cannot modify that user.", red));
            return;
        }
        const msg = await channel.send(author.toString(), util.embed("Ban Member", "Purge messages of how many days?"));
        const coll = msg.createReactionCollector((r, u) => u.id !== msg.client.user.id, {time: 10000});
        coll.on("collect", async (r, u) => {
            await r.users.cache.delete(u);
            if(u.id !== author.id) return null;
            let days = 0;
            switch(r.emoji.toString()) {
                case "❌":
                    days = 0;
                    break;
                case emojiFile["1"]:
                    days = 1;
                    break;
                case emojiFile["2"]:
                    days = 2;
                    break;
                case emojiFile["3"]:
                    days = 3;
                    break;
                case emojiFile["4"]:
                    days = 4;
                    break;
                case emojiFile["5"]:
                    days = 5;
                    break;
                case emojiFile["6"]:
                    days = 6;
                    break;
                case emojiFile["7"]:
                    days = 7;
                    break;
            }
            args.shift();
            await channel.send(author.toString(), util.embed("Banned Member", "**" + member.user.username + "** has been banned from the server by user: " + author.toString() + (days ? "\n**Days:** " + days + ")" : "") + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
            await member.ban({
                days: days,
                reason: member.user.username + " has been banned from the server by user: " + author.username + (args[0] ? "(reason: " + args.join(" ") + ")" : "")
            });
            message.delete();
        });
        coll.on("end", async () => await msg.delete());
        try {
            await msg.react("❌");
            await msg.react(emojiFile["1"]);
            await msg.react(emojiFile["2"]);
            await msg.react(emojiFile["3"]);
            await msg.react(emojiFile["4"]);
            await msg.react(emojiFile["5"]);
            await msg.react(emojiFile["6"]);
            await msg.react(emojiFile["7"]);
        } catch(e) {
        }
    }
};
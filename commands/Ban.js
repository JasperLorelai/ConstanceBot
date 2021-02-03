module.exports = {
    name: "ban",
    description: "Ban a guild member.",
    params: ["[user]", "(reason)"],
    guildOnly: true,
    aliases: ["snap"],
    perm: "mod",
    async execute(Libs, message, args) {
        const {Util, EmojiMap, ConditionException} = Libs;
        const {guild, channel, author} = message;

        let member = Util.findGuildMember(args[0], guild);
        if (!member) throw new ConditionException(author, "Ban Member", "User not found.");
        if (!member.bannable) throw new ConditionException(author, "Ban Member", "Cannot modify that user.");
        const msg = await channel.send(author.toString(), Util.embed("Ban Member", "Purge messages of how many days?"));
        const coll = msg.createReactionCollector((r, u) => u.id !== msg.client.user.id, {time: 10000});
        coll.on("collect", async (r, u) => {
            await r.users.remove(u);
            if (u.id !== author.id) return;
            let days = -1;
            switch (r.emoji.toString()) {
                case "❌":
                    days = 0;
                    break;
                case EmojiMap["1"]:
                    days = 1;
                    break;
                case EmojiMap["2"]:
                    days = 2;
                    break;
                case EmojiMap["3"]:
                    days = 3;
                    break;
                case EmojiMap["4"]:
                    days = 4;
                    break;
                case EmojiMap["5"]:
                    days = 5;
                    break;
                case EmojiMap["6"]:
                    days = 6;
                    break;
                case EmojiMap["7"]:
                    days = 7;
                    break;
            }
            await args.shift();
            await channel.send(author.toString(), Util.embed("Banned Member", "**" + member.user.username + "** has been banned from the server by user: " + author.toString() + (days > 0 ? "\n**Days:** " + days : "") + (args[0] ? "\n**For reason:** " + args.join(" ") : "")));
            await member.ban({
                days: days < 0 ? 0 : days,
                reason: member.user.username + " has been banned from the server by user: " + author.username + (args[0] ? "(reason: " + args.join(" ") + ")" : "")
            });
            await message.deleteBot();
        });
        coll.on("end", () => msg.deleteBot());
        try {
            await msg.react("❌");
            await msg.react(EmojiMap["1"]);
            await msg.react(EmojiMap["2"]);
            await msg.react(EmojiMap["3"]);
            await msg.react(EmojiMap["4"]);
            await msg.react(EmojiMap["5"]);
            await msg.react(EmojiMap["6"]);
            await msg.react(EmojiMap["7"]);
        }
        catch (e) {}
    }
};

module.exports = {
    name: "avatar",
    description: "Displays your avatar or the avatar of the specified user. Size is optional and comes in: `16`, `32`, `64`, `128`, `256`, `512`, `1024`, `2048`.",
    aliases: ["pfp"],
    params: ["(user)"],
    async execute(Libs, message, args) {
        const {Config, Util, EmojiMap, ConditionException} = Libs;
        const {author, channel} = message;
        const Client = message.client;

        const user = args[0] ? Util.findUser(args[0]) : author;
        if (!user) throw new ConditionException(author, "Avatar", "User not found!");
        const msg = await channel.send(author.toString(), Util.embed("**" + user.username + "**'s Avatar", "Pick avatar size:\n" +
            EmojiMap["1"] + " - `128`\n" +
            EmojiMap["2"] + " - `256`\n" +
            EmojiMap["3"] + " - `512`\n" +
            EmojiMap["4"] + " - `1024`\n" +
            EmojiMap["5"] + " - `2048`", Config.color.yellow));
        await msg.react(EmojiMap["1"]);
        await msg.react(EmojiMap["2"]);
        await msg.react(EmojiMap["3"]);
        await msg.react(EmojiMap["4"]);
        await msg.react(EmojiMap["5"]);
        const coll = msg.createReactionCollector((r, u) => u.id !== Client.user.id, {time: 15000});
        let size = 128;
        coll.on("collect", (r, u) => {
            r.users.remove(u);
            if (u.id !== author.id) return;
            switch (r.emoji.toString()) {
                case EmojiMap["1"]:
                    size = 128;
                    break;
                case EmojiMap["2"]:
                    size = 256;
                    break;
                case EmojiMap["3"]:
                    size = 512;
                    break;
                case EmojiMap["4"]:
                    size = 1024;
                    break;
                case EmojiMap["5"]:
                    size = 2048;
                    break;
            }
            coll.stop();
        });
        coll.on("end", async () => {
            await msg.deleteBot();
            await channel.send(author.toString(), Util.embed("**" + user.username + "**'s Avatar").setImagePermanent(user.displayAvatarURL({format: "png", size: size})));
        });
    }
};

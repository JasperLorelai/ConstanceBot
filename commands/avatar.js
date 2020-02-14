module.exports = {
    name: "avatar",
    description: "Displays your avatar or the avatar of the specified user. Size is optional and comes in: `16`, `32`, `64`, `128`, `256`, `512`, `1024`, `2048`.",
    aliases: ["pfp"],
    params: ["(user)"],
    async execute(message, args) {
        const {client, author, channel} = message;
        const {config, util, emojiFile} = client;
        const {red, yellow} = config.color;
        const user = args[0] ? util.findUser(args[0]) : author;
        if(!user) {
            await channel.send(author.toString(), util.embed("Avatar", "User not found!", red));
            return null;
        }
        const msg = await channel.send(author.toString(), util.embed("**" + user.username + "**'s Avatar", "Pick avatar size:\n" + emojiFile["1"] + " - `128`\n" + emojiFile["2"] + " - `256`\n" + emojiFile["3"] + " - `512`\n" + emojiFile["4"] + " - `1024`\n" + emojiFile["5"] + " - `2048`", yellow));
        await msg.react(emojiFile["1"]);
        await msg.react(emojiFile["2"]);
        await msg.react(emojiFile["3"]);
        await msg.react(emojiFile["4"]);
        await msg.react(emojiFile["5"]);
        const coll = msg.createReactionCollector((r, u) => u.id !== client.user.id, {time: 15000});
        let size = 128;
        coll.on("collect", (r, u) => {
            r.users.cache.delete(u);
            if(u.id !== author.id) return;
            switch(r.emoji.toString()) {
                case emojiFile["1"]:
                    size = 128;
                    break;
                case emojiFile["2"]:
                    size = 256;
                    break;
                case emojiFile["3"]:
                    size = 512;
                    break;
                case emojiFile["4"]:
                    size = 1024;
                    break;
                case emojiFile["5"]:
                    size = 2048;
                    break;
            }
            coll.stop();
        });
        coll.on("end", async () => {
            if(!msg.deleted) await msg.delete();
            await channel.send(author.toString(), util.embed("**" + user.username + "**'s Avatar")
                .attachFiles([{
                    attachment: await client.fetch(user.displayAvatarURL({
                        format: "png", size: size
                    })).then(y => y.buffer()), name: "avatar.png"
                }])
                .setImage("attachment://avatar.png"));
        });
    }
};
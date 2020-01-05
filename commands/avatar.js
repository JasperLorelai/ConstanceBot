module.exports = {
    name: "avatar",
    description: "Displays your avatar or the avatar of the specified user. Size is optional and comes in: `16`, `32`, `64`, `128`, `256`, `512`, `1024`, `2048`.",
    aliases: ["pfp"],
    params: ["(user)"],
    async execute(message, args) {
        const {client, author, channel} = message;
        const {config, emoji} = client;
        const {red, yellow} = config.color;
        const user = args[0] ? config.findUser(args[0]) : author;
        if(!user) {
            await channel.send(author.toString(), config.embed("Avatar", "User not found!", red));
            return null;
        }
        const msg = await channel.send(author.toString(), config.embed("**" + user.username + "**'s Avatar", "Pick avatar size:\n" +
            emoji["1"] + " - `128`\n" +
            emoji["2"] + " - `256`\n" +
            emoji["3"] + " - `512`\n" +
            emoji["4"] + " - `1024`\n" +
            emoji["5"] + " - `2048`",
            yellow));
        await msg.react(emoji["1"]);
        await msg.react(emoji["2"]);
        await msg.react(emoji["3"]);
        await msg.react(emoji["4"]);
        await msg.react(emoji["5"]);
        const coll = msg.createReactionCollector((r, u) => u.id !== client.user.id, {time: 15000});
        let size = 128;
        coll.on("collect", (r, u) => {
            r.users.remove(u);
            if(u.id !== author.id) return;
            switch(r.emoji.toString()) {
                case emoji["1"]:
                    size = 128;
                    break;
                case emoji["2"]:
                    size = 256;
                    break;
                case emoji["3"]:
                    size = 512;
                    break;
                case emoji["4"]:
                    size = 1024;
                    break;
                case emoji["5"]:
                    size = 2048;
                    break;
            }
            coll.stop();
        });
        coll.on("end", async () => {
            await msg.delete();
            await channel.send(author.toString(), config.embed("**" + user.username + "**'s Avatar")
                .attachFiles([{
                    attachment: await client.fetch(user.displayAvatarURL({
                        format: "png",
                        size: size
                    })).then(y => y.buffer()), name: "avatar.png"
                }])
                .setImage("attachment://avatar.png")
            );
        });
    }
};
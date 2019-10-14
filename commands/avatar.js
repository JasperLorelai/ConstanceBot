module.exports = {
    name: "avatar",
    description: "Displays your avatar or the avatar of the specified user. Size is optional and comes in: `16`, `32`, `64`, `128`, `256`, `512`, `1024`, `2048`.",
    aliases: ["pfp"],
    params: ["(user)"],
    async execute(message, args) {
        const {client, author, channel} = message;
        const {config, emoji} = client;
        const user = args[0] ? config.findUser(client, args[0]) : author;
        if(!user) {
            await channel.send(config.embed(client, "Avatar", "User not found!", "ff0000"));
            return null;
        }
        const msg = await channel.send(config.embed(client,"**" + user.username + "**'s Avatar","Pick avatar size:\n" +
            "❌ - default `128`\n" +
            emoji["1"] + " - `16`\n" +
            emoji["2"] + " - `32`\n" +
            emoji["3"] + " - `64`\n" +
            emoji["4"] + " - `128`\n" +
            emoji["5"] + " - `256`\n" +
            emoji["6"] + " - `512`\n" +
            emoji["7"] + " - `1024`\n" +
            emoji["8"] + " - `2048`",
        "fcba03"));
        const coll = msg.createReactionCollector((r,u) => u.id !== client.user.id,{time:5000});
        let size = 128;
        coll.on("collect", (r,u) => {
            r.users.remove(u);
            if(u.id !== author.id) return;
            switch (r.emoji.toString()) {
                case "❌":
                    size = 128;
                    break;
                case emoji["1"]:
                    size = 16;
                    break;
                case emoji["2"]:
                    size = 32;
                    break;
                case emoji["3"]:
                    size = 64;
                    break;
                case emoji["4"]:
                    size = 128;
                    break;
                case emoji["5"]:
                    size = 256;
                    break;
                case emoji["6"]:
                    size = 512;
                    break;
                case emoji["7"]:
                    size = 1024;
                    break;
                case emoji["8"]:
                    size = 2048;
                    break;
            }
            coll.stop();
        });
        coll.on("end", async () => {
            msg.delete();
            await channel.send(config.embed(client,"**" + user.username + "**'s Avatar")
                .attachFiles([{attachment:await client.fetch(user.displayAvatarURL({format:"png",size:size})).then(y => y.buffer()),name:"avatar.png"}])
                .setImage("attachment://avatar.png")
            );
        });
        try {
            await msg.react("❌");
            await msg.react(emoji["1"]);
            await msg.react(emoji["2"]);
            await msg.react(emoji["3"]);
            await msg.react(emoji["4"]);
            await msg.react(emoji["5"]);
            await msg.react(emoji["6"]);
            await msg.react(emoji["7"]);
            await msg.react(emoji["8"]);
        } catch (e) {}
    }
};
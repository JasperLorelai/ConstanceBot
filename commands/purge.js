// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "purge",
    description: "Clear messages in text channel. It maps the latest specified amount of messages to delete. You can apply a filter for a specific user.",
    aliases: ["clean", "clear", "delete"],
    params: ["[number]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const {channel, client, author, guild} = message;
        const {config, util} = client;
        try {
            const {red, yellow} = config.color;
            let num = parseInt(args[0]);
            if (!num || num < 1) {
                await channel.send(author.toString(), util.embed("Channel Purge", "Parameter `number` is not a number or is less than 1!", red));
                return;
            }
            const over = num > 50;
            num = over ? 50 : num;
            let messages = await channel.messages.fetch({limit: num + 1});
            messages.delete(message.id, "botIntent");
            const msg = await channel.send(author.toString(), util.embed("Channel Purge", "**Messages found:** " + (over ? "limited to `50`" : "`" + num + "`") + "\n\n**React with:\n🗑 - to delete currently selected.\n😃 - to apply user filter.**", yellow));
            await msg.react("🗑");
            await msg.react("😃");
            const created = new Date().getTime();
            const coll = msg.createReactionCollector((r, u) => u.id !== client.user.id, {time: 30000});
            coll.on("collect", async (r, u) => {
                await r.users.remove(u);
                if (u.id !== author.id) return null;

                async function handleDeletePrompt(message, messages) {
                    const msg = await message.channel.send(author.toString(), util.embed("Delete Confirmation", "**Messages found by filter:** `" + messages.size + "`\n\n**React with:\n❌ - to cancel delete.\n✅ - to confirm delete.**", yellow));
                    await msg.react("❌");
                    await msg.react("✅");
                    const coll = msg.createReactionCollector((r, u) => u.id !== message.client.user.id, {time: 10000});
                    coll.on("collect", async (r, u) => {
                        await r.users.remove(u);
                        if (u.id !== message.author.id) return;
                        switch (r.emoji.toString()) {
                            case "❌":
                                coll.stop();
                                break;
                            case "✅":
                                coll.stop();
                                messages.each(m => m.delete({reason: "botIntent"}));
                                break;
                        }
                    });
                    coll.on("end", async () => await msg.delete({reason: "botIntent"}));
                }

                switch (r.emoji.toString()) {
                    case "🗑":
                        coll.stop("chosen");
                        await handleDeletePrompt(message, messages);
                        break;
                    case "😃":
                        const msgUser = await msg.channel.send(author.toString(), util.embed("Channel Purge - By User", "Please specify a user who's messages would be deleted.", yellow));
                        const collUser = msgUser.channel.createMessageCollector(m => m.author.id === author.id, {time: util.collTtl(coll, created)});
                        let member;
                        collUser.on("collect", mUser => {
                            member = util.findGuildMember(mUser.content, guild);
                            mUser.delete({reason: "botIntent"});
                            if (!member) {
                                msg.channel.send(author.toString(), util.embed("Channel Purge - By User", "User not found!", red)).then(tempMsg => {
                                    tempMsg.delete({timeout: 3000, reason: "botIntent"});
                                });
                            }
                            else collUser.stop("found");
                        });
                        collUser.on("end", async (c, reason) => {
                            await msgUser.delete({reason: "botIntent"});
                            coll.stop("chosen");
                            if (reason === "found") await handleDeletePrompt(message, messages.filter(m => m.author.id === member.id));
                        });
                        break;
                }
            });
            coll.on("end", async (c, reason) => {
                if (reason === "chosen") {
                    await msg.delete({reason: "botIntent"});
                    await message.delete({reason: "botIntent"});
                }
                else {
                    await msg.reactions.removeAll();
                    await msg.edit(util.getEmbeds(msg)[0].setDescription("**Messages found:** " + (over ? "limited to `50`" : "`" + num + "`") + "\n\n**Timed out.**").setColor("666666"));
                }
            });
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "purge",
    description: "Clear messages in text channel. It map the latest specified amount of messages to delete for which you can apply filters like RegEx or by user.",
    aliases: ["clean","clear","delete"],
    params: ["[number]"],
    guildOnly: true,
    perm: "mod",
    async execute(message, args) {
        const fun = require("../files/config");
        let num = parseInt(args[0]);
        if(!num || num < 1) {
            await message.channel.send(fun.embed(message.client,"Channel Purge","Parameter `number` is not a number or is less than 1!","ff0000"));
            return;
        }
        const over = num > 50;
        num = over ? 50 : num;
        let messages = await message.channel.messages.fetch({limit:num+1});
        messages.delete(message.id);
        const msg = await message.channel.send(fun.embed(message.client,"Channel Purge","**Messages found:** " + (over ? "limited to `50`" : "`" + num + "`") + "\n\n**React with:\n🗑 - to delete currently selected.\n😃 - to apply user filter.\n📰 - to apply RegEx filter.**","fcba03"));
        await msg.react("🗑");
        await msg.react("😃");
        // TODO: Finish regex.
        //await msg.react("📰");
        const created = new Date().getTime();
        const coll = msg.createReactionCollector((r,u) => u.id !== msg.client.user.id, {time:30000});
        coll.on("collect", async (r,u) => {
            await r.users.remove(u);
            if(u.id !== message.author.id) return null;
            async function handleDeletePrompt(message,messages) {
                const msg = await message.channel.send(fun.embed(message.client,"Delete Confirmation","**Messages found by filter:** `" + messages.size + "`\n\n**React with:\n❌ - to cancel delete.\n✅ - to confirm delete.**","fcba03"));
                await msg.react("❌");
                await msg.react("✅");
                const coll = msg.createReactionCollector((r,u) => u.id !== message.client.user.id, {time: 10000});
                coll.on("collect", async (r,u) => {
                    await r.users.remove(u);
                    if(u.id !== message.author.id) return;
                    switch (r.emoji.toString()) {
                        case "❌":
                            coll.stop();
                            break;
                        case "✅":
                            coll.stop();
                            await message.channel.bulkDelete(messages);
                            break;
                    }
                });
                coll.on("end", async () => {
                    await msg.delete();
                });
            }
            switch (r.emoji.toString()) {
                case "🗑":
                    coll.stop("chosen");
                    await handleDeletePrompt(message,messages);
                    break;
                case "😃":
                    const msgUser = await msg.channel.send(fun.embed(msg.client,"Channel Purge - By User","Please specify a user who's messages would be deleted.","fcba03"));
                    const collUser = msgUser.channel.createMessageCollector(m => m.author.id === message.author.id, {time:fun.collTtl(coll,created)});
                    let member;
                    collUser.on("collect", mUser => {
                        member = fun.findGuildMember(mUser.content,message.guild);
                        mUser.delete();
                        if(!member) {
                            msg.channel.send(fun.embed(msg.client,"Channel Purge - By User","User not found!","ff0000")).then(tempMsg => {
                                tempMsg.delete({timeout:3000});
                            });
                        }
                        else collUser.stop("found");
                    });
                    collUser.on("end", async (c,reason) => {
                        await msgUser.delete();
                        coll.stop("chosen");
                        if(reason === "found") await handleDeletePrompt(message,messages.filter(m => m.author.id === member.id));
                    });
                    break;
                case "📰":
                    coll.stop("chosen");
                    break;
            }
        });
        coll.on("end", async (c,reason) => {
            if(reason === "chosen") {
                await msg.delete();
                await message.delete();
            }
            else {
                await msg.reactions.removeAll();
                await msg.edit(fun.getEmbed(msg).setDescription("**Messages found:** " + (over ? "limited to `50`" : "`" + num + "`") + "\n\n**Timed out.**").setColor("666666"));
            }
        });
    }
};
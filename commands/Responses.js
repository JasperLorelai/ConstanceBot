module.exports = {
    name: "responses",
    description: "Manage auto responses.",
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message) {
        const {Config, Util, Keyv} = Libs;
        const {guild, channel, member} = message;

        async function getResponses() {
            let db = await Keyv.get("guilds");
            if (!db) db = {};
            if (!db[guild.id]) db[guild.id] = {};
            if (!db[guild.id].responses) db[guild.id].responses = [];
            const responses = db[guild.id].responses;
            return !responses.size ? responses.map((r, i) => "[**" + (i + 1) + "**] **Regex:** `" + r.trigger + "` **- reply:** " + r.reply).join("\n") : null;
        }

        const msg = await channel.send(Util.embed("Auto Responses", (await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**", Config.color.yellow));
        await msg.react("➖");
        await msg.react("➕");
        const created = Date.now();
        let idle = true;
        const coll = msg.createReactionCollector((r, u) => u.id !== msg.client.user.id, {time: 90000});
        coll.on("collect", async (r, u) => {
            await r.users.remove(u);
            if (u.id !== member.id) return;
            if (!idle) return;
            switch (r.emoji.toString()) {
                case "➕":
                    idle = false;
                    const msgTrigger = await msg.reply(Util.embed("Create Trigger", "Send a regex object.", Config.color.yellow));
                    const collTrigger = msgTrigger.channel.createMessageCollector(m => m.author.id === member.id, {time: Util.collTtl(coll, created)});
                    collTrigger.on("collect", async mTrigger => {
                        const trigger = mTrigger.content;
                        collTrigger.stop();
                        if (!trigger.isRegex()) {
                            msg.reply(Util.embed("Create Trigger", "Trigger must be a regex object!", Config.color.red)).then(tempMsg => tempMsg.deleteLater(3000));
                            return;
                        }
                        const msgReply = await mTrigger.reply(Util.embed("Create Reply", "Send what the reply message should be.", Config.color.yellow));
                        await mTrigger.delete();
                        const collReply = msgReply.channel.createMessageCollector(m => m.author.id === member.id, {time: Util.collTtl(coll, created)});
                        collReply.on("collect", async mReply => {
                            const reply = mReply.content;
                            await mReply.delete();
                            collReply.stop();
                            let db = await Keyv.get("guilds");
                            if (!db) db = {};
                            if (!db[guild.id]) db[guild.id] = {};
                            if (!db[guild.id].responses) db[guild.id].responses = [];
                            db[guild.id].responses.push({trigger: trigger, reply: reply});
                            await Keyv.set("guilds", db);
                            await msg.edit(msg.getFirstEmbed().setDescription((await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**"));
                            msg.reply(Util.embed("Auto Response Creator", "Auto response created!", Config.color.green)).then(tempMsg => tempMsg.deleteLater(3000));
                        });
                        collReply.on("end", async () => await msgReply.delete());
                    });
                    collTrigger.on("end", async () => {
                        await msgTrigger.delete();
                        idle = true;
                    });
                    break;
                case "➖":
                    idle = false;
                    let db = await Keyv.get("guilds");
                    if (!db) db = {};
                    if (!db[guild.id]) db[guild.id] = {};
                    if (!db[guild.id].responses) db[guild.id].responses = [];
                    const responses = db[guild.id].responses;
                    if (responses.length < 1) {
                        msg.reply(Util.embed("Auto Response Delete", "There are no responses in DB to delete!", Config.color.red)).then(tempMsg => tempMsg.deleteLater(3000));
                        return;
                    }
                    const msgIndex = await msg.reply(Util.embed("Auto Response Delete", "Send an index of the response you wish to delete.", Config.color.yellow));
                    const collIndex = msgIndex.channel.createMessageCollector(m => m.author.id === member.id, {time: 10000});
                    collIndex.on("collect", async mIndex => {
                        const ind = parseInt(mIndex.content) - 1;
                        await mIndex.delete();
                        if (ind >= responses.length) {
                            msg.reply(Util.embed("Auto Response Delete", "There is no response with that index!", Config.color.red)).then(tempMsg => tempMsg.deleteLater(3000));
                            return null;
                        }
                        collIndex.stop();
                        let db = await Keyv.get("guilds");
                        if (!db) db = {};
                        if (!db[guild.id]) db[guild.id] = {};
                        if (!db[guild.id].responses) db[guild.id].responses = [];
                        db[guild.id].responses = db[guild.id].responses.filter((r, i) => i !== ind);
                        await Keyv.set("guilds", db);
                        await msg.edit(member.toString(), msg.getFirstEmbed().setDescription((await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**"));
                        msg.reply(Util.embed("Auto Response Creator", "Auto response deleted!", Config.color.green)).then(tempMsg => tempMsg.deleteLater(3000));
                    });
                    collIndex.on("end", async () => {
                        await msgIndex.delete();
                        idle = true;
                    });
                    break;
            }
        });
        coll.on("end", async () => {
            await msg.edit(msg.getFirstEmbed().setDescription(await getResponses() || "No responses in DB.").setColor(Config.color.base));
            await msg.reactions.removeAll();
        });
    }
};

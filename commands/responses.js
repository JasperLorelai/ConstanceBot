module.exports = {
    name: "responses",
    description: "Manage auto reponsese.",
    guildOnly: true,
    perm: "mod",
    async execute(message) {
        const {guild, client, channel, member} = message;
        const {config, util, keyv} = client;
        try {

            async function getResponses() {
                let db = await keyv.get("guilds");
                if (!db) db = {};
                if (!db[guild.id]) db[guild.id] = {};
                if (!db[guild.id].responses) db[guild.id].responses = [];
                const responses = db[guild.id].responses;
                return !responses.length ? responses.map((r, i) => "[**" + (i + 1) + "**] **Regex:** `" + r.trigger + "` **- reply:** " + r.reply).join("\n") : null;
            }

            const msg = await channel.send(util.embed("Auto Responses", (await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**", config.color.yellow));
            await msg.react("➖");
            await msg.react("➕");
            const created = new Date().getTime();
            let idle = true;
            const coll = msg.createReactionCollector((r, u) => u.id !== msg.client.user.id, {time: 90000});
            coll.on("collect", async (r, u) => {
                await r.users.remove(u);
                if (u.id !== member.id) return;
                if (!idle) return;
                switch (r.emoji.toString()) {
                    case "➕":
                        idle = false;
                        const msgTrigger = await msg.channel.send(member.toString(), util.embed("Create Trigger", "Send a regex object.", config.color.yellow));
                        const collTrigger = msgTrigger.channel.createMessageCollector(m => m.author.id === member.id, {time: util.collTtl(coll, created)});
                        collTrigger.on("collect", async mTrigger => {
                            const trigger = mTrigger.content;
                            collTrigger.stop();
                            if (!util.isRegex(trigger)) {
                                msg.channel.send(member.toString(), util.embed("Create Trigger", "Trigger must be a regex object!", config.color.red)).then(tempMsg => {
                                    tempMsg.delete({timeout: 3000});
                                });
                                return null;
                            }
                            const msgReply = await mTrigger.channel.send(member.toString(), util.embed("Create Reply", "Send what the reply message should be.", config.yellow));
                            mTrigger.delete();
                            const collReply = msgReply.channel.createMessageCollector(m => m.author.id === member.id, {time: util.collTtl(coll, created)});
                            collReply.on("collect", async mReply => {
                                const reply = mReply.content;
                                mReply.delete();
                                collReply.stop();
                                let db = await keyv.get("guilds");
                                if (!db) db = {};
                                if (!db[guild.id]) db[guild.id] = {};
                                if (!db[guild.id].responses) db[guild.id].responses = [];
                                db[guild.id].responses.push({trigger: trigger, reply: reply});
                                await keyv.set("guilds", db);
                                await msg.edit(util.getEmbeds(msg)[0].setDescription((await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**"));
                                msg.channel.send(member.toString(), util.embed("Auto Response Creator", "Auto response created!", config.color.green)).then(tempMsg => {
                                    tempMsg.delete({timeout: 3000});
                                });
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
                        let db = await keyv.get("guilds");
                        if (!db) db = {};
                        if (!db[guild.id]) db[guild.id] = {};
                        if (!db[guild.id].responses) db[guild.id].responses = [];
                        const responses = db[guild.id].responses;
                        if (responses.length < 1) {
                            msg.channel.send(member.toString(), util.embed("Auto Response Delete", "There are no responses in DB to delete!", config.color.red)).then(tempMsg => {
                                tempMsg.delete({timeout: 3000});
                            });
                            return null;
                        }
                        const msgIndex = await msg.channel.send(member.toString(), util.embed("Auto Response Delete", "Send an idex of the response you wish to delete.", config.color.yellow));
                        const collIndex = msgIndex.channel.createMessageCollector(m => m.author.id === member.id, {time: 10000});
                        collIndex.on("collect", async mIndex => {
                            const ind = parseInt(mIndex.content) - 1;
                            mIndex.delete();
                            if (ind >= responses.length) {
                                msg.channel.send(member.toString(), util.embed("Auto Response Delete", "There is no reponse with that index!", config.color.red)).then(tempMsg => {
                                    tempMsg.delete({timeout: 3000});
                                });
                                return null;
                            }
                            collIndex.stop();
                            let db = await keyv.get("guilds");
                            if (!db) db = {};
                            if (!db[guild.id]) db[guild.id] = {};
                            if (!db[guild.id].responses) db[guild.id].responses = [];
                            db[guild.id].responses = db[guild.id].responses.filter((r, i) => i !== ind);
                            await keyv.set("guilds", db);
                            await msg.edit(member.toString(), util.getEmbeds(msg)[0].setDescription((await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**"));
                            msg.channel.send(member.toString(), util.embed("Auto Response Creator", "Auto response deleted!", config.color.green)).then(tempMsg => {
                                tempMsg.delete({timeout: 3000});
                            });
                        });
                        collIndex.on("end", async () => {
                            await msgIndex.delete();
                            idle = true;
                        });
                        break;
                }
            });
            coll.on("end", async () => {
                await msg.edit(util.getEmbeds(msg)[0].setDescription(await getResponses() || "No responses in DB.").setColor(config.color.base));
                await msg.reactions.removeAll();
            });
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};

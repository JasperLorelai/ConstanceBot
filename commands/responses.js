module.exports = {
    name: "responses",
    description: "Manage auto reponsese.",
    guildOnly: true,
    perm: "mod",
    async execute(message) {
        const {guild, client, channel, member} = message;
        const {config, keyv} = client;
        const {green, yellow, red} = config.color;
        const path = "responses." + guild.id;
        async function getResponses() {
            const responses = await keyv.get(path);
            return (responses ? responses.map((r,i) => "[**" + (i+1) + "**] **Regex:** `" + r.trigger + "` **- reply:** " + r.reply).join("\n") : null);
        }
        const msg = await channel.send(config.embed( "Auto Responses",(await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**",yellow));
        await msg.react("➖");
        await msg.react("➕");
        const created = new Date().getTime();
        let idle = true;
        const coll = msg.createReactionCollector((r,u) => u.id !== msg.client.user.id, {time:90000});
        coll.on("collect", async (r,u) => {
            await r.users.remove(u);
            if(u.id !== member.id) return;
            if(!idle) return;
            switch(r.emoji.toString()) {
                case "➕":
                    idle = false;
                    const msgTrigger = await msg.channel.send(config.embed("Create Trigger","Send a regex object.",yellow));
                    const collTrigger = msgTrigger.channel.createMessageCollector(m => m.author.id === member.id, {time:config.collTtl(coll,created)});
                    collTrigger.on("collect", async mTrigger => {
                        const trigger = mTrigger.content;
                        collTrigger.stop();
                        if(!config.isRegex(trigger)) {
                            msg.channel.send(config.embed("Create Trigger","Trigger must be a regex object!",red)).then(tempMsg => {
                                tempMsg.delete({timeout:3000});
                            });
                            return null;
                        }
                        const msgReply = await mTrigger.channel.send(config.embed("Create Reply","Send what the reply message should be.",yellow));
                        mTrigger.delete();
                        const collReply = msgReply.channel.createMessageCollector(m => m.author.id === member.id, {time:config.collTtl(coll,created)});
                        collReply.on("collect", async mReply => {
                            const reply = mReply.content;
                            mReply.delete();
                            collReply.stop();
                            await keyv.set(path, (await keyv.get(path) || []).concat({trigger: trigger, reply: reply}));
                            await msg.edit(config.getEmbed(msg).setDescription((await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**"));
                            msg.channel.send(config.embed("Auto Response Creator","Auto response created!",green)).then(tempMsg => {
                                tempMsg.delete({timeout:3000});
                            });
                        });
                        collReply.on("end", async () => {
                            await msgReply.delete();
                        });
                    });
                    collTrigger.on("end", async () => {
                        await msgTrigger.delete();
                        idle = true;
                    });
                    break;
                case "➖":
                    idle = false;
                    const responses = await keyv.get(path) || [];
                    if(responses.length < 1) {
                        msg.channel.send(config.embed("Auto Response Delete","There are no responses in DB to delete!",red)).then(tempMsg => {
                            tempMsg.delete({timeout:3000});
                        });
                        return null;
                    }
                    const msgIndex = await msg.channel.send(config.embed("Auto Response Delete","Send an idex of the response you wish to delete.",yellow));
                    const collIndex = msgIndex.channel.createMessageCollector(m => m.author.id === member.id, {time:10000});
                    collIndex.on("collect", async mIndex => {
                        const ind = parseInt(mIndex.content)-1;
                        mIndex.delete();
                        if(ind >= responses.length) {
                            msg.channel.send(config.embed("Auto Response Delete","There is no reponse with that index!",red)).then(tempMsg => {
                                tempMsg.delete({timeout:3000});
                            });
                            return null;
                        }
                        collIndex.stop();
                        await keyv.set(path,responses.filter((r, i) => i !== ind));
                        await msg.edit(config.getEmbed(msg).setDescription((await getResponses() || "No responses in DB.") + "\n\n**React with:\n➖ - to remove a response.\n➕ - to add a new response.**"));
                        msg.channel.send(config.embed("Auto Response Creator","Auto response deleted!",green)).then(tempMsg => {
                            tempMsg.delete({timeout:3000});
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
            await msg.edit(config.getEmbed(msg).setDescription(await getResponses()).setColor(config.baseEmbedColor));
            await msg.reactions.removeAll();
        });
    }
};
module.exports = {
    name: "poll",
    description: "Creates a poll.",
    guildOnly: true,
    perm: "mod",
    async execute(message) {
        const {channel, author, client, guild} = message;
        const {config, util, keyv} = client;
        const pollrole = util.findRole("Polls", guild);
        let db;

        function getHelp(poll) {
            return "React with:" +
                "\n💬 - Set text." +
                "\n➕ - Add react option." +
                "\n🚫 - Reset reactions." +
                (pollrole ? "\n💟 - Ping everyone with the Polls role. (`" + poll.rolePing + "`)" : "") +
                "\n" + client.emojiFile["1"] + " - Unique reactions only. (`" + poll.unique + "`)" +
                "\n✅ - Send poll." +
                "\n❌ - Cancel poll.";
        }

        async function refresh(msg, poll) {
            const embed = util.getEmbeds(msg)[0];
            embed.fields[0].value = getHelp(poll);
            embed.setDescription(poll.text || "No text set.");
            await msg.edit(embed);
        }

        async function newPoll(msg, poll, index) {
            if (index && index > 0) {
                db = await keyv.get("users");
                if (!db) db = {};
                if (!db[author.id]) db[author.id] = {};
                if (!db[author.id].polls) db[author.id].polls = [];
                delete db[author.id].polls[index - 1];
                db[author.id].polls = db[author.id].polls.filter(e => e);
                await keyv.set("users", db);
            }

            // Constructor
            if (!poll) poll = {};
            if (!poll.text) poll.text = "No text set.";
            if (!poll.emoji) poll.emoji = [];
            if (!poll.rolePing) poll.rolePing = false;
            if (!poll.unique) poll.unique = false;
            if (!poll.draftID) poll.draftID = new Date().getTime();

            const embed = util.embed("Poll Creator", poll.text, config.color.yellow).addField("Help", getHelp(poll));
            if (poll.emoji && poll.emoji.length > 0) embed.addField("Emoji", poll.emoji.join(", "));
            if (!msg) msg = await channel.send(embed);
            else await msg.edit(embed);

            await msg.react("💬");
            await msg.react("➕");
            await msg.react("🚫");
            if (pollrole) await msg.react("💟");
            await msg.react(client.emojiFile["1"]);
            await msg.react("✅");
            await msg.react("❌");
            const created = new Date().getTime();
            const collector = msg.createReactionCollector((r, u) => u.id !== client.user.id, {time: 300000});
            collector.on("collect", async (r, u) => {
                await r.users.remove(u);
                if (u.id !== author.id) return null;
                let msg2, msgColl;
                switch (r.emoji.toString()) {
                    case "💬":
                        msg2 = await channel.send(author.toString(), util.embed("Poll Creator - Text Manager", "Type a message to be used for the poll text. Type `cancel` to cancel.", config.color.yellow));
                        msgColl = channel.createMessageCollector(m => m.author.id !== client.user.id, {time: util.collTtl(collector, created)});
                        msgColl.on("collect", m => {
                            if (!poll) return;
                            if (m.content.trim().toLowerCase() !== "cancel") {
                                poll.text = m.content;
                                refresh(msg, poll);
                            }
                            m.delete();
                            msgColl.stop();
                        });
                        msgColl.on("end", () => msg2.delete());
                        break;
                    case "➕":
                        msg2 = await channel.send(author.toString(), util.embed("Poll Creator - Reaction Manager", "Type a message that includes reactions.", config.color.yellow));
                        msgColl = channel.createMessageCollector(m => m.author.id !== client.user.id, {time: util.collTtl(collector, created)});
                        msgColl.on("collect", m => {
                            if (!poll) return;
                            const emoji = poll.emoji.concat(util.getEmoji(m.content)).filter(e => e);
                            if (emoji[0]) {
                                poll.emoji = emoji;
                                const embed = util.getEmbeds(msg)[0];
                                if (embed.fields.length > 1) embed.fields[1].value = emoji.join(", "); else embed.addField("Emoji", emoji.join(", "));
                                msg.edit(embed);
                                msgColl.stop();
                            }
                            m.delete();
                        });
                        msgColl.on("end", () => msg2.delete());
                        break;
                    case "🚫":
                        if (poll.emoji.length > 0) {
                            poll.emoji = [];
                            await msg.edit(util.getEmbeds(msg)[0].spliceFields(1, 1));
                        }
                        break;
                    case "💟":
                        if (pollrole) poll.rolePing = !poll.rolePing;
                        break;
                    case client.emojiFile["1"]:
                        poll.unique = !poll.unique;
                        break;
                    case "✅":
                        msg2 = await channel.send(author.toString(), util.embed("Poll Creator - Sender", "Type the channel you'd like to send this poll to.", config.color.yellow));
                        msgColl = channel.createMessageCollector(m => m.author.id !== client.user.id, {time: util.collTtl(collector, created)});
                        msgColl.on("collect", async m => {
                            if (!poll) return;
                            const ch = util.findChannel(m.content, guild);
                            if (ch) {
                                const embed = util.embed(null, poll.text);
                                embed.setAuthor(author.username, author.displayAvatarURL());
                                embed.setFooter("Unique reactions | " + embed.footer.text);
                                embed.setColor(config.color.poll);
                                const created = await ch.send(poll.rolePing && pollrole ? "<@&" + pollrole.id + ">" : "", embed);
                                for (let emoji of poll.emoji) await created.react(emoji);
                                msg.delete();
                                msgColl.stop();
                                collector.stop("done");
                            }
                            else {
                                const embed = util.getEmbeds(msg2)[0];
                                await msg2.edit(embed.setDescription(embed.description + "\n\n**Channel not found!**").setColor(config.color.red));
                            }
                            m.delete();
                        });
                        msgColl.on("end", () => msg2.delete());
                        break;
                    case "❌":
                        poll = null;
                        collector.stop("end");
                        break;
                }
                if (poll) await refresh(msg, poll);
            });
            collector.on("end", async (coll, reason) => {
                if (reason === "done") {
                    if (!message.deleted) message.delete();
                    return;
                }
                await msg.reactions.removeAll();
                await msg.edit(util.embed("PollCreator Cancelled", reason === "end" ? "Cancelled poll." : "Timeout.", reason === "end" ? config.color.red : config.color.gray));
                if (!message.deleted) message.delete();
                if (poll) {
                    db = await keyv.get("users");
                    if (!db) db = {};
                    if (!db[author.id]) db[author.id] = {};
                    if (!db[author.id].polls) db[author.id].polls = [];
                    db[author.id].polls.push(poll);
                    await keyv.set("users", db);
                }
            });
        }

        // Attempt to recover polls.
        let polls = await keyv.get("polls." + author.id);
        if (polls) polls = polls.filter(poll => poll.draftID + 172800000 > new Date().getTime());
        let msg;
        if (polls && polls.length > 0) {
            await keyv.set("polls." + author.id, polls);
            msg = await channel.send(author.toString(), util.embed("Poll Drafts", "**0**. New poll.\n" + polls.map((poll, i) => "**" + (i + 1) + "**. `" + new Date(poll.draftID).toLocaleString() + "`").join("\n"), config.color.yellow));
            const collector = channel.createMessageCollector(m => m.author.id !== client.user.id, {time: 10000});
            collector.on("collect", async m => {
                const index = parseInt(m.content);
                m.delete();
                if (index) {
                    if (polls.length >= index) {
                        collector.stop("end");
                        let poll = polls[index - 1];
                        if (poll) await newPoll(msg, poll, index);
                    }
                }
                else {
                    collector.stop("end");
                    await newPoll(msg);
                }
            });
            collector.on("end", async (coll, reason) => {
                if (reason !== "end") await msg.edit(util.embed("Poll Drafts - Terminated.", "Timeout.", config.color.red));
            });
        }
        else await newPoll(msg);
    }
};

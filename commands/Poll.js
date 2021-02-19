module.exports = {
    name: "poll",
    description: "Creates a poll.",
    guildOnly: true,
    perm: "mod",
    aliases: ["polls"],
    async execute(Libs, message) {
        const {Config, Util, Keyv, EmojiMap} = Libs;
        const {channel, author, guild} = message;
        const Client = message.client;

        const pollRoleID = Config.getGuildData(guild.id)?.roles?.polls;
        const pollRole = pollRoleID ? guild.roles.resolve(pollRoleID) : Util.findRole("Polls", guild);
        let db;

        function getHelp(poll) {
            return "React with:" +
                "\n💬 - Set text." +
                "\n➕ - Add react option." +
                "\n🚫 - Reset reactions." +
                (pollRole ? "\n💟 - Ping everyone with the " + pollRole.toString() + " role. (`" + poll.rolePing + "`)" : "") +
                "\n" + EmojiMap["1"] + " - Unique reactions only. (`" + poll.unique + "`)" +
                "\n✅ - Send poll." +
                "\n❌ - Cancel poll.";
        }

        async function refresh(msg, poll) {
            const embed = msg.getFirstEmbed();
            embed.fields[0].value = getHelp(poll);
            embed.setDescription(poll.text || "No text set.");
            await msg.edit(embed);
        }

        async function newPoll(msg, poll, index) {
            if (index && index > 0) {
                db = await Keyv.get("users");
                if (!db) db = {};
                if (!db[author.id]) db[author.id] = {};
                if (!db[author.id].polls) db[author.id].polls = [];
                delete db[author.id].polls[index - 1];
                db[author.id].polls = db[author.id].polls.filter(e => e);
                await Keyv.set("users", db);
            }

            // Constructor
            if (!poll) poll = {};
            if (!poll.text) poll.text = "No text set.";
            if (!poll.emoji) poll.emoji = [];
            if (!poll.rolePing) poll.rolePing = false;
            if (!poll.unique) poll.unique = false;
            if (!poll.draftID) poll.draftID = Date.now();

            const embed = Util.embed("Poll Creator", poll.text, Config.color.yellow).addField("Help", getHelp(poll));
            if (poll.emoji && poll.emoji.length > 0) embed.addField("Emoji", poll.emoji.join(", "));
            if (!msg) msg = await channel.send(embed);
            else await msg.edit(embed);

            await msg.react("💬");
            await msg.react("➕");
            await msg.react("🚫");
            if (pollRole) await msg.react("💟");
            await msg.react(EmojiMap["1"]);
            await msg.react("✅");
            await msg.react("❌");
            const created = Date.now();
            const collector = msg.createReactionCollector((r, u) => u.id !== Client.user.id, {time: 300000});
            collector.on("collect", async (r, u) => {
                await r.users.remove(u);
                if (u.id !== author.id) return;
                let msg2, msgColl;
                switch (r.emoji.toString()) {
                    case "💬":
                        msg2 = await channel.send(author.toString(), Util.embed("Poll Creator - Text Manager", "Type a message to be used for the poll text. Type `cancel` to cancel.", Config.color.yellow));
                        msgColl = channel.createMessageCollector(m => m.author.id !== Client.user.id, {time: Util.collTtl(collector, created)});
                        msgColl.on("collect", m => {
                            if (!poll) return;
                            if (m.content.trim().toLowerCase() !== "cancel") {
                                poll.text = m.content;
                                refresh(msg, poll);
                            }
                            m.deleteBot();
                            msgColl.stop();
                        });
                        msgColl.on("end", () => msg2.deleteBot());
                        break;
                    case "➕":
                        msg2 = await channel.send(author.toString(), Util.embed("Poll Creator - Reaction Manager", "Type a message that includes reactions.", Config.color.yellow));
                        msgColl = channel.createMessageCollector(m => m.author.id !== Client.user.id, {time: Util.collTtl(collector, created)});
                        msgColl.on("collect", m => {
                            if (!poll) return;
                            const emoji = poll.emoji.concat(m.content.getEmoji()).filter(e => e);
                            if (emoji[0]) {
                                poll.emoji = emoji;
                                const embed = msg.getFirstEmbed();
                                if (embed.fields.length > 1) embed.fields[1].value = emoji.join(", "); else embed.addField("Emoji", emoji.join(", "));
                                msg.edit(embed);
                                msgColl.stop();
                            }
                            m.deleteBot();
                        });
                        msgColl.on("end", () => msg2.deleteBot());
                        break;
                    case "🚫":
                        if (poll.emoji.length > 0) {
                            poll.emoji = [];
                            await msg.edit(msg.getFirstEmbed().spliceFields(1, 1));
                        }
                        break;
                    case "💟":
                        if (pollRole) poll.rolePing = !poll.rolePing;
                        break;
                    case EmojiMap["1"]:
                        poll.unique = !poll.unique;
                        break;
                    case "✅":
                        msg2 = await channel.send(author.toString(), Util.embed("Poll Creator - Sender", "Type the channel you'd like to send this poll to.", Config.color.yellow));
                        msgColl = channel.createMessageCollector(m => m.author.id !== Client.user.id, {time: Util.collTtl(collector, created)});
                        msgColl.on("collect", async m => {
                            if (!poll) return;
                            const ch = Util.findChannel(m.content, guild);
                            if (ch) {
                                let embed = Util.embed(null, poll.text)
                                    .setAuthor(author.username)
                                    .setAuthorIcon(author.getAvatar())
                                    .setColor(Config.color.poll);
                                embed = embed.setFooterText("Unique reactions | " + embed.footer.text);
                                const created = await ch.send(poll.rolePing && pollRole ? "<@&" + pollRole.id + ">" : "", embed);
                                for (let emoji of poll.emoji) await created.react(emoji);
                                await msg.deleteBot();
                                msgColl.stop();
                                collector.stop("done");
                            }
                            else {
                                msgColl.stop();
                                channel.send(author.toString(), Util.embed("Poll Creator - Sender", "**Channel not found!***", Config.color.red)).then(m => m.deleteBot(10000));
                                return;
                            }
                            await m.deleteBot();
                        });
                        msgColl.on("end", () => msg2.deleteBot());
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
                    await message.deleteBot();
                    return;
                }
                await msg.reactions.removeAll();
                await msg.edit(Util.embed("PollCreator Cancelled", reason === "end" ? "Cancelled poll." : "Timeout.", reason === "end" ? Config.color.red : Config.color.gray));
                await message.deleteBot();
                if (poll) {
                    db = await Keyv.get("users");
                    if (!db) db = {};
                    if (!db[author.id]) db[author.id] = {};
                    if (!db[author.id].polls) db[author.id].polls = [];
                    db[author.id].polls.push(poll);
                    await Keyv.set("users", db);
                }
            });
        }

        // Attempt to recover polls.
        let polls = await Keyv.get("polls." + author.id);
        if (polls) polls = polls.filter(poll => poll.draftID + 172800000 > Date.now());
        let msg;
        if (polls && polls.length > 0) {
            await Keyv.set("polls." + author.id, polls);
            msg = await channel.send(author.toString(), Util.embed("Poll Drafts", "**0**. New poll.\n" + polls.map((poll, i) => "**" + (i + 1) + "**. `" + new Date(poll.draftID).toLocalFormat() + "`").join("\n"), Config.color.yellow));
            const collector = channel.createMessageCollector(m => m.author.id !== Client.user.id, {time: 10000});
            collector.on("collect", async m => {
                const index = parseInt(m.content);
                await m.deleteBot();
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
                if (reason !== "end") await msg.edit(Util.embed("Poll Drafts - Terminated.", "Timeout.", Config.color.red));
            });
        }
        else await newPoll(msg);
    }
};

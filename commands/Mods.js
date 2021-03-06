module.exports = {
    name: "mod",
    description: "Configure guild Mods - roles or users that will pass for the 'mod' permission.",
    guildOnly: true,
    perm: "admin",
    aliases: ["mods"],
    async execute(Libs, message) {
        const {Config, Util, Keyv} = Libs;
        const {guild, author} = message;
        const Client = message.client;

        const instr = "**React with:**\n➕ - to add Mods.\n➖ - to remove Mods.";

        async function getList() {
            let db = await Keyv.get("guilds");
            if (!db) db = {};
            if (!db[guild.id]) db[guild.id] = {};
            if (!db[guild.id].mods) db[guild.id].mods = {};
            const mods = db[guild.id].mods;
            let [roles, users] = [null, null];
            if (mods) {
                users = mods.users || null;
                roles = mods.roles || null;
            }
            return ("**Current mods:**\n- **users:** " + (users ? users.map(u => "<@" + u + ">").join(", ") : "*empty*") + "\n- **roles:** " + (roles ? roles.map(r => "<@&" + r + ">").join(", ") : "*empty*"));
        }

        const msg = await message.reply(Util.embed("Server Mods", await getList() + "\n\n" + instr));
        await msg.react("➕");
        await msg.react("➖");
        const collector = msg.createReactionCollector((r, u) => u.id !== Client.user.id, {time: 90000});
        collector.on("collect", async (r, u) => {
            await r.users.remove(u);
            if (!["➕", "➖"].includes(r.emoji.toString())) return;
            if (u.id !== author.id) return;
            const msgInput = await msg.reply(Util.embed("Configure Server Mods", "Please specify a role or a user. Timeout of this prompt is **10s**.", Config.color.yellow));
            const collMod = msg.channel.createMessageCollector(m => m.author.id === author.id, {time: 10000});
            collMod.on("collect", async m => {
                let find = Util.findRole(m.content, m.guild);
                let found;
                if (find) found = ["roles", find.id]; else {
                    find = Util.findGuildMember(m.content, m.guild);
                    if (find) found = ["users", find.id];
                }
                if (!found) {
                    m.channel.send(author.toString(), Util.embed(null, "Role or User not found!", Config.color.red)).then(notFound => notFound.deleteLater(3000));
                    collMod.stop();
                    await m.delete();
                    return;
                }
                let db = await Keyv.get("guilds");
                if (!db) db = {};
                if (!db[guild.id]) db[guild.id] = {};
                if (!db[guild.id].mods) db[guild.id].mods = {};
                if (!db[guild.id].mods[found[0]]) db[guild.id].mods[found[0]] = [];
                let mods = db[guild.id].mods[found[0]];
                switch (r.emoji.toString()) {
                    case "➕":
                        if (mods.includes(found[1])) {
                            collMod.stop();
                            break;
                        }
                        mods = mods.concat(found[1]);
                        db[guild.id].mods[found[0]] = mods;
                        await Keyv.set("guilds", db);
                        break;
                    case "➖":
                        mods = mods.filter(e => e !== found[1]);
                        db[guild.id].mods[found[0]] = !mods.length ? null : mods;
                        await Keyv.set("guilds", db);
                        break;
                }
                collMod.stop();
                await m.delete();
            });
            collMod.on("end", async () => {
                await msg.edit(Util.embed("Configure Server Mods", await getList() + "\n\n" + instr));
                await msgInput.delete();
                await r.users.remove(u);
            });
        });
        collector.on("end", async () => {
            if (msg.deleted) return;
            await msg.reactions.removeAll();
            await msg.edit(Util.embed("Configure Server Mods", await getList() + "\n\nPrompt timed out."));
        });
    }
};

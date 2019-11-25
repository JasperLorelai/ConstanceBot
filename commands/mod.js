module.exports = {
    name: "mod",
    description: "Configure guild Mods - roles or users that will pass for the 'mod' permission.",
    guildOnly: true,
    perm: "admin",
    aliases: ["mods"],
    async execute(message) {
        const {client, guild, channel, author} = message;
        const {config, keyv} = client;
        const {red} = config.color;
        const instr = "**React with:**\n➕ - to add Mods.\n➖ - to remove Mods.";
        async function getList() {
            const roles = await keyv.get("mod.roles." + guild.id);
            const users = await keyv.get("mod.users." + guild.id);
            return ("**Current mods:**\n- **users:** " + (users ? users.map(u => "<@" + u + ">").join(", ") : "*empty*") + "\n- **roles:** " + (roles ? roles.map(r => "<@&" + r + ">").join(", ") : "*empty*"));
        }
        channel.send(config.embed( "Configure Server Mods", (await getList()) + "\n\n" + instr)).then(async msg => {
            await msg.react("➕");
            await msg.react("➖");
            const coll = msg.createReactionCollector((r,u) => u.id !== client.user.id,{time:90000});
            coll.on("collect", async (r, u) => {
                if(!["➕","➖"].includes(r.emoji.toString())) {
                    await r.users.remove(u);
                    return;
                }
                const msgInput = await msg.channel.send(config.embed(null, "Please specify a role or a user. Timeout of this prompt is **10s**.", "0"));
                const collMod = msg.channel.createMessageCollector(m => m.author.id === author.id, {time:10000});
                collMod.on("collect", async m => {
                    let find = config.findRole(m.content, m.guild);
                    let found;
                    if(find) found = ["roles", find.id];
                    else {
                        find = config.findGuildMember(m.content, m.guild);
                        if(find) found = ["users", find.id];
                    }
                    if(found) {
                        const path = "mod." + found[0] + "." + guild.id;
                        let old = await keyv.get(path);
                        switch(r.emoji.toString()) {
                            case "➕":
                                if(old && old.includes(found[1])) {
                                    m.channel.send(config.embed(null, "Role or User is already in the list!", red)).then(exists => {
                                        exists.delete({timeout:3000});
                                        collMod.stop();
                                    });
                                }
                                else await keyv.set(path, old ? old.concat(found[1]) : [found[1]]);
                                break;
                            case "➖":
                                if(old) {
                                    const final = old.filter(e => e !== found[1]);
                                    if(final && final.length > 0) await keyv.set(path, final ? final : "empty");
                                    else await keyv.clear(path);
                                }
                                break;
                        }
                    }
                    else m.channel.send(config.embed(null, "Role or User not found!", red)).then(notFound => notFound.delete({timeout:3000}));
                    collMod.stop();
                    await m.delete();
                });
                collMod.on("end", async () => {
                    await msg.edit(config.embed("Configure Server Mods", (await getList()) + "\n\n" + instr));
                    await msgInput.delete();
                    await r.users.remove(u);
                });
            });
            coll.on("end", async () => {
                if(msg.deleted) return;
                await msg.reactions.removeAll();
                await msg.edit(config.embed("Configure Server Mods", (await getList()) + "\n\nPrompt timed out."));
            });
        });
    }
};
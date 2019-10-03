module.exports = {
    name: "mod",
    description: "Configure guild Mods - roles or users that will pass for the 'mod' permission.",
    guildOnly: true,
    perm: "admin",
    async execute(message) {
        const fun = require(process.env.INIT_CWD + "\\files\\config.js");
        const keyv = message.client.keyv;
        const id =  message.guild.id;
        const instr = "**React with:**\n➕ - to add Mods.\n➖ - to remove Mods.";
        async function getList() {
            const roles = await keyv.get("mod.roles." + id);
            const users = await keyv.get("mod.users." + id);
            return ("**Current mods:**\n- **users:** " + (users ? users.map(u => "<@" + u + ">").join(", ") : "*empty*") + "\n- **roles:** " + (roles ? roles.map(r => "<@&" + r + ">").join(", ") : "*empty*"));
        }
        message.channel.send("", await fun.embed(message.client, "Configure Server Mods", (await getList()) + "\n\n" + instr)).then(async msg => {
            await msg.react("➕");
            await msg.react("➖");
            const coll = msg.createReactionCollector((r,u) => u.id !== message.client.user.id,{time:90000});
            coll.on("collect", async (r, u) => {
                switch(r.emoji.toString()) {
                    case "➕":
                        const msgInput = await msg.channel.send(await fun.embed(message.client, null, "Please specify a role or a user. Timeout of this prompt is **10s**.", "0"));
                        const collMod = msg.channel.createMessageCollector(m => m.author.id == message.author.id, {time:10000});
                        collMod.on("collect", async m => {
                            let find = fun.findRole(m.content, m.guild);
                            let found;
                            if(find) found = ["roles", find.id];
                            else {
                                find = fun.findGuildMember(m.content, m.guild);
                                if(find) found = ["users", find.id];
                            }
                            if(found) {
                                const path = "mod." + found[0] + "." + id;
                                let old = await keyv.get(path);
                                if(old.includes(found[1])) {
                                    const exists = await m.channel.send(await fun.embed(m.client, null, "Role or User is already in the list!", "f00"))
                                    exists.delete({timeout:3000});
                                    collMod.stop();
                                }
                                else await keyv.set(path, old ? old.concat(found[1]) : [found[1]]);
                            }
                            else {
                                const notFound = await m.channel.send(await fun.embed(m.client, null, "Role or User not found!", "f00"));
                                notFound.delete({timeout:3000});
                            }
                            collMod.stop();
                            await m.delete();
                        });
                        collMod.on("end", async () => {
                            await msg.edit("", await fun.embed(message.client, "Configure Server Mods", (await getList()) + "\n\n" + instr));
                            await msgInput.delete();
                            await r.users.remove(u);
                        });
                        break;
                    case "➖":
                        // TODO: Finish removing roles.
                        await msg.edit("", await fun.embed(message.client, "Configure Server Mods", (await getList()) + "\n\n" + instr));
                        break;
                }
            });
            coll.on("end", async () => {
                if(msg.deleted) return;
                await msg.reactions.removeAll();
                await msg.edit("", await fun.embed(message.client, "Configure Server Mods", (await getList()) + "\n\nPrompt timed out."));
            });
        });
    }
};
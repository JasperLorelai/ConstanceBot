module.exports = {
    name: "mod",
    description: "Configure guild Mods - roles or users that will pass for the 'mod' permission.",
    guildOnly: true,
    perm: "admin",
    getList() {
        const users = keyv.get("mod.user." + id);
        const roles = keyv.get("mod.user." + id);
        return "**Current mods:**\n- **users:** " + (users ? users.map(u => "<@" + u + ">").join(", ") : "*empty*") + "\n- **roles:** " + (roles ? roles.map(r => "<@&" + r + ">").join(", ") : "*empty*");
    },
    async execute(message) {
        const fun = require(process.env.INIT_CWD + "\\files\\config.js");
        const keyv = message.client.keyv;
        const id =  message.guild.id;
        message.channel.send(await fun.embed(message.client, "Configure Server Mods" , this.getList() + "\nReact with:\n➕ - to add Mods.\n➖ - to remove Mods.\n🔁 - to reload list.")).then(msg => {
            await message.react("◀");
            await message.react("▶");
            const coll = msg.createReactionCollector((r,u) => u.id !== message.client.id,{time:90000});
            coll.on("collect", r => {
                switch(r.emoji.toString()) {
                    case "➕":
                        break;
                    case "➖":
                        break;
                    case "🔁":
                        msg.edit(await fun.embed(message.client, "Configure Server Mods" , this.getList() + "\nReact with:\n➕ - to add Mods.\n➖ - to remove Mods.\n🔁 - to reload list."));
                        break;
                }
            });
            coll.on("end", () => {
                if(msg.deleted) return;
                msg.reactions.removeAll();
                msg.edit(await fun.embed(message.client, "Configure Server Mods" , getList() + "\nPrompt timed out.");
            });
        });
    }
};
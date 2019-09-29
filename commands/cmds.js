module.exports = {
    name: "cmds",
    description: "Lists of all bot commands.",
    aliases: ["commands"],
    async execute(message) {
        const fun = require(process.env.INIT_CWD + "\\files\\config.js");
        let perm;
        const text = message.client.commands.map(c => {
            perm = c.perm;
            if(perm === "author") perm = "**Bot Author**";
            if(perm === "admin") perm = "**Server Administrator**";
            if(perm === "mod") perm = "**Server Moderator**";
            return "- `" + c.name +
                (c.params ? " " + c.params.join(" ") : "") + "` " +
                (perm ? " - Required permissions: " + perm : "")
        }).join("\n") + (!message.guild ? "\n\nUse the `dmcmds` command to only list commands that can be executed in DMs." : "");
        await message.channel.send(message.author.toString(), fun.embed(message.client, "Command List", text));
    },
};
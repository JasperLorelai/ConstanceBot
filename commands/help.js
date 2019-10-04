module.exports = {
    name: "help",
    description: "Show info about a specific command.",
    aliases: ["command"],
    params: ["[command]"],
    execute(message, args) {
        const fun = require(process.env.INIT_CWD + "\\files\\config.js");
        let text;
        const command = message.client.commands.get(args[0]) || message.client.commands.find(cmd => cmd["aliases"] && cmd["aliases"].includes(args[0]));
        if(command) {
            let perm = command.perm;
            if(perm === "author") perm = "Bot Author";
            if(perm === "admin") perm = "Server Administrator";
            if(perm === "mod") perm = "Server Moderator";
            // + "\nYou can edit the message to execute again.");
            text = "**Command name:** " + command.name +
                (command.description ? "\n**Description:** " + command.description : "") +
                (perm ? "\n**Permissions required:** " + perm : "") +
                (command.aliases ? "\n**Aliases:** " + command.aliases.map(a => "`" + a + "`").join(", ") : "") +
                (command.params ? "\n**Parameters:** " + command.params.map(a => "`" + a + "`").join(", ") + "\n**[required] (optional)**" : "");
        }
        // + "\nYou can edit the message to execute again.");
        else text = "Command not found!";
        message.channel.send(message.author.toString(), fun.embed(message.client, "Command Help For: " + args[0], text)).then(async m => {
            if(!command) await m.delete({timeout:5000});
        });
    },
};
module.exports = {
    name: "help",
    description: "Show info about a specific command. Run the `commands` command to display a list of all commands.",
    aliases: ["command"],
    params: ["[command]"],
    async execute(Libs, message, args) {
        const {Util} = Libs;
        const {channel, author} = message;
        const Client = message.client;

        let text;
        // noinspection JSValidateTypes
        const command = Client.commands.get(args[0]) || Client.commands.find(cmd => cmd["aliases"] && cmd["aliases"].includes(args[0]));
        if (command) {
            let perm = command.perm;
            if (perm === "author") perm = "Bot Author";
            if (perm === "admin") perm = "Server Administrator";
            if (perm === "mod") perm = "Server Moderator";
            // + "\nYou can edit the message to execute again.");
            text = "**Command name:** `" + command.name + "`" + (command.description ? "\n**Description:** " + command.description : "") + (perm ? "\n**Permissions required:** " + perm : "") + (command.aliases ? "\n**Aliases:** " + command.aliases.map(a => "`" + a + "`").join(", ") : "") + (command.params ? "\n**Parameters:** " + command.params.map(a => "`" + a + "`").join(", ") + "\n**[required] (optional)**" : "");
        }
        // + "\nYou can edit the message to execute again.");
        else text = "Command not found!";
        channel.send(author.toString(), Util.embed("Command Help For: " + args[0], text)).then(async m => {
            if (!command) await m.delete({timeout: 5000, reason: "botIntent"});
        });
    }
};
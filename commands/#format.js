module.exports = {
    name: "",
    description: "",
    aliases: [],
    params: ["[required]","(optional)"],
    // When true, makes it so it can't be executed in DMs.
    guildOnly: false,
    // Permission required. Options: "author", "admin", "mod"
    perm: "author",
    // Enable if keyv DB is required for the command - it'll be sent as a third
    // parameter for "this#execute()".
    keyv: true,
    // "args" is unneccessary if "params" is empty or has no required parameters.
    execute(message, args) {
        // Storage for main functions. Rarely needed.
        const fun = require(process.env.INIT_CWD + "\\files\\config.js");
    }
};
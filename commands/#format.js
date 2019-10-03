// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "",
    description: "",
    aliases: [],
    params: ["[required]","(optional)"],
    // When true, makes it so it can't be executed in DMs.
    guildOnly: false,
    // Permission required. Options: "author", "admin", "mod"
    perm: "author",
    // "args" is unneccessary if "params" is empty or has no required parameters.
    execute(message, args) {
        // Storage for main functions. Rarely needed.
        // noinspection JSUnusedLocalSymbols
        const fun = require(process.env.INIT_CWD + "\\files\\config.js");
    }
};
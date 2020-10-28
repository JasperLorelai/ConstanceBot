const {Util} = require("../Libs");

// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "",
    description: "",
    aliases: [],
    params: ["[required]", "(optional)"],
    // When true, makes it so it can't be executed in DMs.
    guildOnly: false,
    // Guilds this command will work on.
    guildWhitelist: [],
    // Permission required. Options: "author", "admin", "mod"
    perm: "author",
    hide: true,
    // "args" is unnecessary if "params" is empty or has no required parameters.
    async execute(message, args) {
        try {
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};

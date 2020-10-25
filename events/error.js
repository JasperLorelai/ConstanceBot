const Client = require("../bot");
const {Config} = Client;
Client.on("error", error => {
    Config.botLog().send(Config.embed("Error", "```\n" + error.toString() + "\n```", Config.color.red));
});

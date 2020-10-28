const Client = require("../Client");
const {Config} = Client;
Client.on("error", error => {
    Config.botLog().send(Config.embed("Error", "```\n" + error.toString() + "\n```", Config.color.red));
});

const client = require("../bot");
const {config} = client;
client.on("error", error => {
    config.botLog().send(config.embed("Error", "```\n" + error.toString() + "\n```", config.color.red));
});

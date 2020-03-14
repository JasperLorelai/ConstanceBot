const client = require("../bot");
const {config} = client;
client.on("warn", info => {
    config.botLog().send(config.embed("Warning", ">>> " + info, config.color.yellow));
});

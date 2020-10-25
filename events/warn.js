const Client = require("../bot");
const {Config, Util} = Client;
Client.on("warn", info => {
    Config.botLog().send(Util.embed("Warning", ">>> " + info, Config.color.yellow));
});

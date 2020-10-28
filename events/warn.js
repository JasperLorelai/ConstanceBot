const Client = require("../Client");
const {Config, Util} = require("../Libs");

Client.on("warn", info => {
    Config.botLog().send(Util.embed("Warning", ">>> " + info, Config.color.yellow));
});

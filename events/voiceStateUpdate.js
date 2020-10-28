const Client = require("../Client");
const {Config} = require("../Libs");

async function handleConnect(state) {
    let shouldSee = Config.vcText.find(bundle => bundle.voice.includes(state.channelID));
    shouldSee = shouldSee ? shouldSee.text : [];
    for (const ch of shouldSee) {
        const vc = Client.channels.resolve(ch);
        if (!vc) Config.botLog().send(Config.embed("Voice-Text Handler", "Array `" + state.channelID + "` contains non-existent channel `" + ch + "`.", Config.color.yellow));
        else await vc.updateOverwrite(state.id, {VIEW_CHANNEL: true});
    }
}

async function handleDisconnect(state) {
    let shouldNotSee = Config.vcText.find(bundle => bundle.voice.includes(state.channelID));
    shouldNotSee = shouldNotSee ? shouldNotSee.text : [];
    for (const ch of shouldNotSee) {
        const vc = Client.channels.resolve(ch);
        if (!vc) Config.botLog().send(Config.embed("Voice-Text Handler", "Array `" + state.channelID + "` contains non-existent channel `" + ch + "`.", Config.color.yellow));
        else {
            // noinspection JSCheckFunctionSignatures
            await vc.overwritePermissions(vc.permissionOverwrites.filter(o => o.id !== state.id));
        }
    }
}

Client.on("voiceStateUpdate", async (oldState, newState) => {
    if (!oldState.channelID && newState.channelID) await handleConnect(newState);
    if (oldState.channelID && !newState.channelID) await handleDisconnect(oldState);
    // Process channel moving.
    if (oldState.channelID && newState.channelID) {
        let oldCanSee = Config.vcText.find(bundle => bundle.voice.includes(oldState.channelID));
        oldCanSee = oldCanSee ? oldCanSee.voice : [];
        // Process change if the new channel is not in the same bundle as the old one.
        if (!oldCanSee.includes(newState.channelID)) {
            await handleDisconnect(oldState);
            await handleConnect(newState);
        }
    }
});

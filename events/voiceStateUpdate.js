const client = require("../bot");
const {config} = client;

async function handleConnect(state) {
    let shouldSee = config.vctext.find(bundle => bundle.voice.includes(state.channelID));
    shouldSee = shouldSee ? shouldSee.text : [];
    for (const ch of shouldSee) {
        const vc = client.channels.resolve(ch);
        if (!vc) config.botLog().send(config.embed("Voice-Text Handler", "Array `" + state.channelID + "` contains non-existent channel `" + ch + "`.", config.color.yellow));
        else await vc.updateOverwrite(state.id, {VIEW_CHANNEL: true});
    }
}

async function handleDisconnect(state) {
    let shouldNotSee = config.vctext.find(bundle => bundle.voice.includes(state.channelID));
    shouldNotSee = shouldNotSee ? shouldNotSee.text : [];
    for (const ch of shouldNotSee) {
        const vc = client.channels.resolve(ch);
        if (!vc) config.botLog().send(config.embed("Voice-Text Handler", "Array `" + state.channelID + "` contains non-existent channel `" + ch + "`.", config.color.yellow));
        else {
            // noinspection JSCheckFunctionSignatures
            await vc.overwritePermissions(vc.permissionOverwrites.filter(o => o.id !== state.id));
        }
    }
}

client.on("voiceStateUpdate", async (oldState, newState) => {
    if (!oldState.channelID && newState.channelID) await handleConnect(newState);
    if (oldState.channelID && !newState.channelID) await handleDisconnect(oldState);
    // Process channel moving.
    if (oldState.channelID && newState.channelID) {
        let oldCanSee = config.vctext.find(bundle => bundle.voice.includes(oldState.channelID));
        oldCanSee = oldCanSee ? oldCanSee.voice : [];
        // Process change if the new channel is not in the same bundle as the old one.
        if (!oldCanSee.includes(newState.channelID)) {
            await handleDisconnect(oldState);
            await handleConnect(newState);
        }
    }
});

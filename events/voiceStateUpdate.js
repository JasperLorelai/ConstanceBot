const Client = require("../Client");
const {Config} = require("../Libs");

async function handleBase(state, func) {
    let shouldSee = Config.vcText.find(bundle => bundle.voice.includes(state.channelID));
    shouldSee = shouldSee ? shouldSee.text : [];
    const {guild} = state;
    for (const ch of shouldSee) {
        const vc = guild.channels.resolve(ch);
        if (!vc) Config.botLog().send(Config.embed("Voice-Text Handler", "Array `" + state.channelID + "` contains non-existent channel `" + ch + "`.", Config.color.yellow));
        else await func(vc);
    }

}

async function handleConnect(state) {
    await handleBase(state, async vc => {
        await vc.updateOverwrite(state.id, {VIEW_CHANNEL: true})
    });
}

async function handleDisconnect(state) {
    await handleBase(state, async vc => {
        await vc.overwritePermissions(vc.permissionOverwrites.filter(o => o.id !== state.id));
    });
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

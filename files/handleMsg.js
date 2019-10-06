module.exports = async (message) => {
    // Handle responses.
    for(let r of await message.client.keyv.get("responses." + message.guild.id) || []) {
        // Quite the effort to construct a regex from string.
        // To do: Look into improvement.
        let regex = r.trigger;
        if(regex.match(/\/([a-zA-Z])/g)) regex = [regex.substr(1,regex.lastIndexOf("/")-1),regex.substr(regex.lastIndexOf("/")+1)];
        else regex = [regex,null];
        if(message.content.match(new RegExp(regex[0], regex[1]))) {
            await message.channel.send(r.reply);
            break;
        }
    }
};
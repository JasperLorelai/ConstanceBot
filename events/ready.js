const Client = require("../Client");
const {Config, fetch} = require("../Libs");

Client.on("ready", async () => {
    Config.author = Client.users.resolve((await Client.fetchApplication()).owner.id);

    // Generate a joke which can fit in activity name.
    let joke = "";
    do {
        joke = await fetch(Config.urls.joke, {
            headers: {
                "Accept": "text/plain",
                "User-Agent": Config.userAgent
            }
        }).then(y => y.text());
    }
    while (joke.length > 128);
    console.log(joke);
    await Client.user.setActivity({name: joke, type: "LISTENING"});

    // Fetch all members for initially available guilds
    try {
        const promises = Client.guilds.cache.map(guild => guild.available ? guild.members.fetch() : Promise.resolve());
        await Promise.all(promises);
    } catch (err) {
        console.log("Failed to fetch all members before ready! " + err + "\n" + err.stack);
    }

    console.log("Reafy!");
});

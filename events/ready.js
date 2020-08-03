const client = require("../bot");
client.on("ready", async () => {
    const {config} = client;
    client.config.author = client.users.resolve((await client.fetchApplication()).owner.id);

    let joke = "";
    do {
        joke = await client.fetch(config.urls.joke, {
            headers: {
                "Accept": "text/plain",
                "User-Agent": config.userAgent
            }
        }).then(y => y.text());
    }
    while (joke.length > 128);
    console.log(joke);
    await client.user.setActivity({name: joke, type: "LISTENING"});

    console.log("Reafy!");
});

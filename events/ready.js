const Client = require("../Client");
Client.on("ready", async () => {
    const {Config} = Client;
    Config.author = Client.users.resolve((await Client.fetchApplication()).owner.id);

    let joke = "";
    do {
        joke = await Client.fetch(Config.urls.joke, {
            headers: {
                "Accept": "text/plain",
                "User-Agent": Config.userAgent
            }
        }).then(y => y.text());
    }
    while (joke.length > 128);
    console.log(joke);
    await Client.user.setActivity({name: joke, type: "LISTENING"});

    console.log("Reafy!");
});

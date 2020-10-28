const Client = require("../Client");
const {Config, fetch} = require("../Libs");

Client.on("ready", async () => {
    Config.author = Client.users.resolve((await Client.fetchApplication()).owner.id);

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

    console.log("Reafy!");
});

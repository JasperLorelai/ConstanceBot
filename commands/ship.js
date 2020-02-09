module.exports = {
    name: "ship",
    description: "Calculate the love with the true power of Math.",
    aliases: ["love", "lovecalc"],
    params: ["[target 1]", "(target 2)"],
    guildOnly: true,
    async execute(message, args) {
        const {client, channel, author} = message;
        const {config, util} = client;
        const target1 = util.findUser(args[0]);
        if(!target1) {
            channel.send(author.toString(), util.embed("Love Calculator", "User \"" + args[0] + "\" not found!", config.color.red));
            return;
        }
        let target2 = null;
        // If target2 was specified, check if they exist.
        if(args[1]) {
            target2 = util.findUser(args[1]);
            if(!target2) {
                channel.send(author.toString(), util.embed("Love Calculator", "User \"" + args[1] + "\" not found!", config.color.red));
                return;
            }
        }
        else target2 = author;

        function ship(msg, embedToSend) {
            const c = author.toString();
            const embed = util.getEmbed(msg);
            setTimeout(() => {
                msg.edit(c, embed.setDescription("**.**"));
                setTimeout(() => {
                    msg.edit(c, embed.setDescription("**.**   **.**"));
                    setTimeout(() => {
                        msg.edit(c, embed.setDescription("**.**   **.**   **.**"));
                        setTimeout(() => {
                            msg.edit(c, embedToSend.setColor(embed.color).setTitle(":revolving_hearts::hearts::two_hearts: Shipped :two_hearts::hearts::revolving_hearts:"));
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 250);
        }

        if((!target2 && target1.id === author.id) || (target2 && target1.id === target2.id)) {
            const msg = await channel.send(author.toString(), util.embed("Shipping...").setColorRandom());
            const randomMsg = ["This soul is very poor.", "Missing parameter: ❤", "This heart is too cold to calculate.",
                "Maybe a 🍔 could warm up this cold heart?", "I don't know.", "Blue?"];
            // Pick a random message to display.
            ship(msg, util.embed("", randomMsg[Math.floor(Math.random()*randomMsg.length)]));
            return;
        }

        // Don't ask how this works.
        let a = target1.id;
        let b = target2.id;
        let sumA = 0;
        let sumB = 0;
        a = a.replace(/0/g, "");
        let temp = a.length;
        let temp2 = parseInt(a.substring(a.length - 1));
        if(temp2 === 0) temp2 = 1;
        while(a.length > 1) {
            a = a.replace(/0/g, "");
            sumA += parseInt(a.substring(a.length - 1)) % 10;
            a = a.substring(0, a.length - 1);
        }
        a = sumA * temp * temp2;
        b = b.replace(/0/g, "");
        temp = b.length;
        temp2 = parseInt(b.substring(b.length - 1));
        if(temp2 === 0) temp2 = 1;
        while(b.length > 1) {
            b = b.replace(/0/g, "");
            sumB += parseInt(b.substring(b.length - 1)) % 10;
            b = b.substring(0, b.length - 1);
        }
        b = sumB * temp * temp2;
        temp = a > b ? (b / a * 100).toPrecision(3) : (a / b * 100).toPrecision(3);
        temp += "%";

        // Check cache in case this should be a fake ship.
        for(let s of config.ship) {
            if(s.target1 && s.target2 && s.target1 === target1.id && s.target2 === target2.id) {
                temp = s.calc(temp);
                break;
            }
            if(s.any && (s.any === target1.id || s.any === target2.id)) {
                temp = s.calc(temp);
                break;
            }
        }

        const msg = await channel.send(author.toString(), util.embed("Shipping...", "I solemnly swear I am up to no good.").setColorRandom());
        ship(msg, util.embed("", "Love between **" + target1.username + "** and **" + target2.username + "** is: ***" + temp + "***"));
    }
};
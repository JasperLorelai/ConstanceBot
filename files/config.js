// noinspection JSUnusedGlobalSymbols
module.exports = {
    defaultPrefix: "&",
    ship: [
        // J & Ano
        {target1: "192710597106728960", target2: "588523406333575189", calc: () => "obvious. It's like when your math teacher asks you what's 0=0. Just stop. Ok?"},
        // Kyo
        {any: "321386112448856064", calc: c => "-" + c},
        // Sen
        {any: "359658850724478978", calc: c => "A very gay " + c + ". No, really, you can't \"no homo\" this now, so congrats."},
        // Pingu
        {any: "303184895629459458", calc: c =>  c + " (Brexit approved)"},
        // Pingu & Ano
        {any: "303184895629459458", calc: () =>  "0% (Violates Brexit)"},
        // Constance
        {any: "579759958556672011", calc: () =>  "0%"}
    ],
    color: {
        green: "04ff00",
        yellow: "fcba03",
        red: "ff0000",
        gray: "5c5c5c",
        base: "009dff",
        poll: "02bae3",
        logs: {
            messageUpdate: "6200ff",
            messageDelete: "ff6600",
            guildMemberAdd: "00b33e",
            guildMemberRemove: "a80027",
            channelDelete: "730000"
        }
    },
    guildData: {
        mhap: {
            id: "419628763102314527",
            hostname: "play.mhaprodigy.uk",
            invite: "http://mhaprodigy.uk/discord",
            roles: {
                unverified: "421219080008368128",
                verified: "419654978022539285",
                muted: "419644724119601153",
                bots: "419635738804748289",
                polls: "598335282357600286",
                events: "598335388536274950",
                changelog: "598335450242875392",
                staff: "419964554139926559",
                nsfw: "435465339757789186"
            },
            channels: {
                bot: "673521500300640256",
                logs: "673521500300640256"
            },
            categories: {
                olympus: "419646295670784002",
                archive: "619340319418220574"
            },
            messages: {
                rules: "550735939257892865",
                home: "673629257834037285"
            }
        },
        main: {
            id: "575376952517591041",
            channels: {
                bot: "575738387307298831",
                globalLogs: "663988507542421504",
                toDolist: "575695022964473857",
                main: "575738387307298831",
            },
            categories: {
                dmChannels: "632697494865707008"
            }
        },
        lorelai: {
            id: "406825495502782486",
            channels: {
                logs: "717502089336455288"
            }
        },
        nl: {
            id: "704902534241976440",
            hostname: "alegacybegins.mcserv.co",
            invite: "https://discord.gg/Z9R4j7g",
            roles: {
                player: "704906830425620531",
                notify: "707080930728083508"
            },
            channels: {
                logs: "716811006801608819",
                triumvirate: "704927190654910505",
                leadership: "704927046228246570",
                interview2: "716131375127724032",
                interview: "709915026852675646",
                general: "704909426762580049"
            },
            messages: {
                notify: "709955815213236225"
            }
        }
    },
    trello: {
        boards: {
            mhap: "YBbW2ZTP"
        },
        cards: {
            quirksRoster: "uEL55Rqn",
            characters: "9qhuraUB"
        }
    },
    urls: {
        mcServerQuery: "https://api.mcsrvstat.us/2/",
        forms: {
            staffapp: "https://docs.google.com/forms/d/e/1FAIpQLSdBDDYZ9533HAYuyT500KQTMmX5HZk70SggktlxxoVU7e2ezQ/viewform?usp=pp_url&entry.500203582=",
            suggestions: "https://docs.google.com/forms/d/e/1FAIpQLSfAvHfhebjZ2qgBfkUC5eXFLCqDGzrjOa4REncwLN2P3_HY-A/viewform?usp=pp_url&entry.1021015769=",
            supportticket: "https://docs.google.com/forms/d/e/1FAIpQLSc2RncxLbzmS_N25onb-2pWC_X9k4NKdglTR1oH0GN8DsXRFg/viewform?usp=pp_url&entry.1524462986=EVERYONE!&entry.303030427="
        },
        trello: "https://api.trello.com/1/",
        discordAPI: {
            users: "https://discordapp.com/api/users/@me",
            oauth2: "https://discordapp.com/api/oauth2/"
        },
        mhap: "http://mhaprodigy.uk/"
    },
    vcText: [
        {
            // The Disco, Lounge, Living Room, Tree House, Basement
            voice: ["419636274979143700", "419628763102314531", "419634460104065024", "419635113702457364", "616630459543322664"],
            // voice-chat, music-bot
            text: ["421171068645015553", "419636349780623380"]
        },
        {
            // Staff chat
            voice: ["419646844776480778"],
            // staff-voice-chat
            text: ["475132287877513226"]
        }
    ],
    getClient() {
        return require("../bot");
    },
    getWebhookID() {
        return process.env.WEBHOOK_REDIRECT.match(/[0-9]+/)[0];
    },
    botLog() {
        return this.getMainGuild().channels.resolve(this.guildData.main.channels.bot);
    },
    getMainGuild() {
        return this.getClient().guilds.resolve(this.guildData.main.id);
    },
    getOverwrites(type, everyoneRole) {
        if (type === "mhapDefault") {
            const roles = this.guildData.mhap.roles;
            return [
                {id: everyoneRole, deny: ["VIEW_CHANNEL"]},
                {id: roles.verified, allow: ["VIEW_CHANNEL"]},
                {id: roles.muted, deny: ["SEND_MESSAGES"]}
            ];
        }
        return [];
    },
    getHomeEmbed() {
        const roles = this.guildData.mhap.roles;
        const {urls} = this;
        return this.util.embed("My Hero Academia Prodigy - Information")
            .addField("Basic Information",
                "**IP:** `" + this.guildData.mhap.hostname + "`\n" +
                "**Version:** Release 1.13.2\n" +
                "**Discord Invite:** " + urls.mhap + "discord\n" +
                "**Trello Board:** " + urls.mhap + "trello")
            .addField("Forms",
                "**Would you like suggest something?** [(Click here)](" + urls.mhap + "suggest)\n" +
                "**Need support?** [(Click here)](" + urls.mhap + "support)\n" +
                "**Would you like to apply for staff?** [(Click here)](" + urls.mhap + "apply)")
            .addField("Authentication","🔞 - **NSFW Authentication** - *This authentication is here to warn the recipient to not open the channel at the office or near young children because the channels it will reveal after accepting contain sexual or repulsive content.*\nReact with the displayed reaction to toggle access to the NSFW channel section.")
            .addField("Toggle Pingable Roles",
                "📦 - <@&" + roles.polls + "> - If you have this role, you will be pinged whenever a poll is up.\n" +
                "📆 - <@&" + roles.events + "> - If you have this role, you will be pinged whenever an envent is announced.\n" +
                "📰 - <@&" + roles.changelog + "> - If you have this role, you will be pinged whenever a changelog is released.\n")
    },
    async reactHomeEmbed(message) {
        await message.react("🔞");
        await message.react("📦");
        await message.react("📆");
        await message.react("📰");
    },
    getGuildData(id) {
        for (const guild in this.guildData) {
            if (guild.id === id) return guild;
        }
        return null;
    },
};

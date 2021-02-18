const Keyv = require("keyv");

let keyv = getConnection();

function getConnection() {
    return new Keyv(process.env.DATABASE);
}

async function handleQuery(query) {
    try {
        return await query();
    }
    catch (e) {
        if (!e.message.includes("closed state")) {
            console.error(e);
            return;
        }
        keyv = getConnection();
        return await handleQuery(query);
    }
}

module.exports = {
    async get(key) {
        return await handleQuery(async () => await keyv.get(key));
    },
    async set(key, value) {
        await handleQuery(async () => await keyv.set(key, value));
    }
}

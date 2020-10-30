const KeyvClass = require("keyv");
const Keyv = new KeyvClass(process.env.DATABASE);
const Discord = require("discordjs");
const fs = require("fs");
const fetch = require("node-fetch");
const Canvas = require("canvas");
const FormData = require("form-data");

const EmojiMap = require("./files/EmojiMap");
const Config = require("./files/Config");
const Util = require("./files/Util");

const handleMsg = require("./files/handleMsg");

const btoa = require("btoa");
const atob = require("atob");
const ms = require("ms");
const sha1 = require("sha1");
const md5 = require("md5");

module.exports = {
    Keyv: Keyv,
    Discord: Discord,
    fs: fs,
    fetch: fetch,
    Canvas: Canvas,
    FormData: FormData,

    EmojiMap: EmojiMap,
    Config: Config,
    Util: Util,

    handleMsg: handleMsg,

    btoa: btoa,
    atob: atob,
    ms: ms,
    sha1: sha1,
    md5: md5
}
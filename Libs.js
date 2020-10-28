const Keyv = require("keyv");
const keyv = new Keyv(process.env.DATABASE);
const Discord = require("discordjs");
const fs = require("fs");
const fetch = require("node-fetch");
const canvas = require("canvas");
const formData = require("form-data");

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
    keyv: keyv,
    Discord: Discord,
    fs: fs,
    fetch: fetch,
    canvas: canvas,
    formData: formData,

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

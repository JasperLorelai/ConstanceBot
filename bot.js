const express = require("express");
const app = express();
app.get("/", (request, response) => response.sendStatus(200));
app.listen(process.env.PORT);

const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const fs = require("fs");
const ms = require("ms");
const YouTube = require("simple-youtube-api");
const youtube = new YouTube(process.env.YOUTUBE_API_KEY);
const ytdl = require("ytdl-core");
const yaml = require("js-yaml");
const fetch = require("node-fetch");
const Rcon = require("rcon");
const PromiseFtp = require("promise-ftp");
const ftp = new PromiseFtp();
function jsonify(yml) {return yaml.load(fs.readFileSync(yml,{encoding:"utf-8"}))}
function ymlify(json) {return JSON.stringify(json,null,2)}

var author;
var mainGuild;
var logChannel;
var newMinecraft;
var serverOnline=true;



// On start
client.on("ready", () => {
  const config = jsonify("./files/config.yml");
  console.log("Reafy!");
  author = client.users.resolve(config.author);
  mainGuild = client.guilds.resolve(config.coreGuild);
  logChannel = mainGuild.channels.resolve(config.botLogs);
  newMinecraft = client.channels.resolve(config.newMinecraft);
  client.user.setPresence({activity:{name:(client.user.id == config.zatanna) ? "over John Constantine" : "over Zatanna Zatara",type:"WATCHING"}});
});
// Other
//client.on("error", error => console.log("Error!\n" + error));
//client.on("reconnecting", () => console.log("Reconnecting!"));
//client.on("debug", info => console.log(info));



// Functions
function embedPreset() {
  return {embed:{color:13959423,image:{url:""},thumbnail:{url:""},description:"",author:{name:"",icon_url:"",url:""},footer:{text:"Bot made by: " + author.username,icon_url:author.displayAvatarURL()},timestamp: new Date()}};
}

function textSend(title,description,mess,time=0,color=13959423) {
  let emb = embedPreset();
  emb.embed.title = title;
  emb.embed.description = description;
  emb.embed.color = color;
  mess.channel.startTyping();
  mess.channel.send("",emb).then(msg => {
    mess.channel.stopTyping();
    if(time>0 && !msg.deleted) msg.delete({timeout:time*1000})
  });
  if(time>0 && !mess.deleted) mess.delete({timeout:time*1000});
}

function findRole(guild,find) {
  const roles = guild.roles.array();
  roles.shift();
  for(let r of roles) {
    if(
      find == r.id ||
      find.substring(3,find.length-1) == r.id ||
      find.toLowerCase() == r.name.toLowerCase() ||
      r.name.toLowerCase().includes(find.toLowerCase())
    ) return r;
  }
  return null;
}

function findGuildMember(guild,find) {
  for(let m of guild.members) {
    if(
      find == m[1].id ||
      find == m[1].user.username ||
      find.substring(2,find.length-1) == m[1].id ||
      find.substring(3,find.length-1) == m[1].id ||
      m[1].user.username.toLowerCase().includes(find.toLowerCase())
    ) return m[1];
  }
  return null;
}

function findMember(find) {
  for(let g of client.guilds) {
    const member = findGuildMember(g[1],find);
    if(member) return {member:member,guild:g[1]};
  }
  return null;
}

function findChannel(find) {
  for(let g of client.guilds.array()) {
    for(let c of g.channels.array()) {
      if(c.type == "dm") continue;
      if(
        c.name.toLowerCase().includes(find) ||
        c.id == find ||
        find.substring(3,find.length-1) == c.id
      ) return c;
    }
  }
}

function hasPerm(guild,member) {
  const modlist = jsonify("./files/modlist.yml");
  if(
    member.hasPermission("ADMINISTRATOR") ||
    member.id == author.id
  ) return true;
  var roles = member.roles.keyArray();
  for(let role of modlist["mods"][guild.id]) if(roles.includes(role)) return true;
  return false;
}

function hasAdminPerm(guild,member) {
  if(
    member.hasPermission("ADMINISTRATOR") ||
    member.id == author.id ||
    guild.id == "510861843086966814"
  ) return true;
  return false;
}

function textPrompt(title,text,seperator,message,time,color,remove,thumbnail) {
  const config = jsonify("./files/config.yml")
  if(time == null) time = 90000;
  if(remove == null) remove = false;
  var embed = embedPreset();
  embed.embed.title = title;
  embed.embed.color = color ? color : 13959423;
  if(thumbnail) {
    client.channels.resolve(config.images).send(message.url,{files:[{
        name:"server-icon.png",
        attachment:Buffer.from(thumbnail.replace(/\\/g,"").replace("data:image/png;base64,","").replace("==",""),"base64")
    }]}).then(m => makePrompt(m.attachments.first().url));
  }
  else makePrompt();
  function makePrompt(url) {
    if(url) embed.embed.thumbnail.url = url;
    message.channel.stopTyping();
    if(text.length<2048) {
      embed.embed.description += text;
      message.channel.send("",embed).then(msg => {
        if(!remove) return;
        msg.react("❌");
        setTimeout(() => {
          const collector = new Discord.ReactionCollector(msg,r => true,{time:"10000"});
          collector.on("collect", () => msg.delete());
          collector.on("end", () => {if(!msg.deleted) msg.reactions.removeAll()});
        },1000);
      });
    }
    else {
      var split = [];
      for(var i=0; i<=text.length; i+=text.lastIndexOf(seperator,i+2048)) {
        split = split.concat(text.substring(i,text.lastIndexOf(seperator,i+2048)));
        if(i==text.lastIndexOf(seperator,i+2048)) split[split.length-1] = text.substring(i,i+2048);
      }
      embed.embed.description = split[0];
      message.channel.send("",embed).then(msg => {
        msg.react("◀");
        setTimeout(() => {msg.react("▶")},100);
        if(remove) msg.react("❌");
        setTimeout(() => {
          const collector = new Discord.ReactionCollector(msg,r => true,{time: time});
          collector.on("collect", r => {
            var index = 1;
            for(var i=0;i<split.length;i++) {
              if(split[i] == embed.embed.description) {
                index = i;
                break;
              }
            }
            switch(r.emoji.toString()) {
              case "▶":
                index = (index+1 >= split.length) ? 0 : index+1;
                embed.embed.description = split[index];
                msg.edit("",embed);
                break;
              case "◀":
                index = (index-1 < 0) ? 1 : index-1;
                embed.embed.description = split[index];
                msg.edit("",embed);
                break;
              case "❌":
                if(remove) msg.delete();
                break;
            }
            r.users.remove(r.users.last());
          });
          collector.on("end", () => {
            if(!msg.deleted) {
              msg.reactions.removeAll();
              msg.react("❤");
            }
          });
        },1000);
      });
    }
  }
}

function isJSON(json){
  try {if(JSON.parse(json) && typeof JSON.parse(json) == "object") return true}
  catch(e) {}
  return false;
}

function toEmbedObj(message) {
  if(!message.embeds[0]) return null;
  let richFound = false;
  for(let e of message.embeds) if(e.type == "rich") richFound = true;
  if(!richFound) return null;
  let index = -1;
  message.embeds.forEach((e,i) => {if(e.type == "rich") index = i});
  let found = message.embeds[index];
  let final = {embed:{}};
  if(found.title) final.embed.title = found.title;
  if(found.description) final.embed.description = found.description;
  if(found.url) final.embed.url = found.url;
  if(found.color) final.embed.color = found.color;
  if(found.timestamp) final.embed.timestamp = found.timestamp;
  if(found.image) final.embed.image = found.image;
  if(found.thumbnail) final.embed.thumbnail = found.thumbnail;
  if(found.author) final.embed.author = found.author;
  if(found.footer) final.embed.footer = found.footer;
  if(found.fields) final.embed.fields = found.fields;
  return final;
}

function getEmoji(str) {
  return str.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
}

function hash8bit(str) {
  let hval = 0x811c9dc5;
  str = str.toString().split("");
  str.forEach(c => {
    hval ^= c.charCodeAt(0);
    hval += (hval<<1)+(hval<<4)+(hval<<7)+(hval<<8)+(hval<<24);
  });
  return ("0000000" +(hval>>>0).toString(16)).substr(-8);
}

function minecraft(msg) {newMinecraft.send(msg)}

function mcconsole(query,funct = r => {}) {
  const config = jsonify("./files/config.yml");
  const rcon = new Rcon(config.rconHost,config.rconPort,config.rconPass);
  rcon.connect();
  rcon.on("auth", () => rcon.send(query));
  rcon.on("response", r => {
    funct(r);
    rcon.disconnect();
  });
}

function constructQuirks() {
  const config = jsonify("./files/config.yml");
  fetch("https://api.trello.com/1/lists/5d78ff3901e17e2d0af193ec/cards?key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd").then(y => y.text()).then(body => {
    let cards = JSON.parse(body);
    // Ignore labled "Ignored".
    cards = cards.filter(c => {
      if(c.labels.length > 0) for(let label of c.labels) if(label.name == "Ignored") return false;
      return true;
    });
    let quirks = [];
    for(let c of cards) {
      let quirk = {color:{},item:"white_stained_glass"};
      quirk.name = c.name;
      if(c.idLabels) quirk.idLabels = c.idLabels;
      if(c.idMembers) quirk.members = c.idMembers;
      let desc = c.desc.split("\n").filter(l => l);
      for(let i in desc) {
        if(desc[i].includes("##Quirk: ")) {
          quirk.quirk = desc[i].substr(9);
          continue;
        }
        if(desc[i] == "###Tier 1:") {
          quirk.tier1 = [
            {
              item: "orange_dye",
              name: desc[i*1+1].substring(4,desc[i*1+1].indexOf(":",4)),
              desc: desc[i*1+1].substring(desc[i*1+1].indexOf(":",4)+5,desc[i*1+1].length-1)
            },
            {
              item: "orange_dye",
              name: desc[i*1+2].substring(4,desc[i*1+2].indexOf(":",4)),
              desc: desc[i*1+2].substring(desc[i*1+2].indexOf(":",4)+5,desc[i*1+2].length-1)
            },
            {
              item: "orange_dye",
              name: desc[i*1+3].substring(4,desc[i*1+3].indexOf(":",4)),
              desc: desc[i*1+3].substring(desc[i*1+3].indexOf(":",4)+5,desc[i*1+3].length-1)
            }
          ];
          i*=1+3;
          continue;
        }
        if(desc[i] == "###Tier 2:") {
          quirk.tier2 = {
            item: "magenta_dye",
            name: desc[i*1+1].substring(4,desc[i*1+1].indexOf(":",4)),
            desc: desc[i*1+1].substring(desc[i*1+1].indexOf(":",4)+5,desc[i*1+1].length-1)
          };
          i++;
          continue;
        }
        if(desc[i] == "###Tier 3:") {
          quirk.tier3 = {
            item: "light_blue_dye",
            name: desc[i*1+1].substring(4,desc[i*1+1].indexOf(":",4)),
            desc: desc[i*1+1].substring(desc[i*1+1].indexOf(":",4)+5,desc[i*1+1].length-1)
          };
          i++;
          continue;
        }
        if(desc[i].includes("**Profile:**")) quirk.profile = desc[i].match(/\*\*([0-9]*)\*\*/)[1];
        if(desc[i].includes("**Quirk Type:**")) quirk.type = desc[i].match(/\*\*([a-zA-Z]*)\*\*/)[1];
        if(desc[i].includes("**Quirk Owner:**")) quirk.owner = desc[i].substring(desc[i].indexOf("** *")+4,desc[i].length-1);
        if(desc[i].includes("**Skins:**")) quirk.skins = desc[i].substr(desc[i].indexOf(":")+4).match(/([a-zA-Z]*)/g).filter(t => t);
        if(desc[i].includes("**Item:**")) quirk.item = desc[i].substring(desc[i].indexOf(":**")+4);
        if(desc[i].includes("**Description:**")) quirk.desc = desc[i].substring(desc[i].indexOf(":**")+4);
        if(desc[i].includes("**ColorCode (Quirk):**")) quirk.color.quirk = desc[i].substring(desc[i].indexOf(":**")+4);
        if(desc[i].includes("**ColorCode (Colon):**")) quirk.color.colon = desc[i].substring(desc[i].indexOf(":**")+4);
        if(desc[i].includes("**ColorCode (Ability):**")) quirk.color.ability = desc[i].substring(desc[i].indexOf(":**")+4);
      }
      quirks.push(quirk);
    }
    fs.writeFileSync("./quirks.json", JSON.stringify(quirks));
    
    // Make predefined items for the crate
    let items = {};
    items["predefined-items"] = {};
    quirks.forEach(q => items["predefined-items"]["Quirk" + q.quirk.replace(/\s/g,"")] = {type: q.item, name: "&6" + q.name});
    
    // Make the preview
    let preview = {"quirkcrate-preview":{"spell-class":"jasperlorelai.MenuSpell","helper-spell":true,tags:["NotSilenceable"],title:"&9Quirk Crate Rewards",delay:1,effects:{Click:{position:"caster",effect:"sound",sound:"item.flintandsteel.use",pitch:0,volume:0.5}},options:{}}};
    let row=2, pos=9, name;
    quirks.forEach((q,i) => {
      if(pos > row*9-3) {
        pos = row*9+1;
        row++;
      }
      else pos++;
      name = "Quirk" + q.quirk.replace(/\s/g,"");
      preview["quirkcrate-preview"]["options"][name] = {slot: parseInt(pos), item:name, spell: "quirkcrate-preview-request"};
    });
    preview["quirkcrate-preview"]["options"]["Filler"] = {slot: ((row+1)*9)-1, item: "light_gray_stained_glass_pane| ", spell: "Dummy", "stay-open": true};
    
    // Qurik Management
    var manage = {"at-quirks-edit-quirk":{"spell-class":".MenuSpell","helper-spell":true,tags:["NotSilenceable"],title:"&9Editing Quirk",delay:1,effects:{Click:{position:"caster",effect:"soundpersonal",sound:"item.flintandsteel.use",pitch:0,volume:0.5}},options:{}}};
    quirks.forEach((q,i) => {
      name = q.quirk.replace(/\s/g,"");
      manage["at-quirks-edit-quirk"]["options"]["Quirk" + name] = {slot:i, item:"Quirk" + name, spell:"at-quirks-set-" + name.toLowerCase()};
      manage["at-quirks-set-" + name.toLowerCase()] = {"spell-class":".MultiSpell","helper-spell":true,tags:["NotSilenceable"],spells:["at-quirks-edit-menu"],modifiers:["chance 100 string AToolsQuirk " + name]};
    });
    
    // Ability Cast Items
    var abilities = {};
    var ability;
    for(let q of quirks) {
      if(q.name == "Copy") continue;
      name = q.quirk.replace(/\s/g,"").toLowerCase();
      ability = q.color.quirk + "&l" + q.quirk + q.color.colon + "&l: " + q.color.ability;
      abilities[name + "-tier1a"] = {type:q.tier1[0].item, name:ability + q.tier1[0].name};
      abilities[name + "-tier1b"] = {type:q.tier1[1].item, name:ability + q.tier1[1].name};
      abilities[name + "-tier1c"] = {type:q.tier1[2].item, name:ability + q.tier1[2].name};
      abilities[name + "-tier2"] = {type:q.tier2.item, name:ability + q.tier2.name};
      abilities[name + "-tier3"] = {type:q.tier3.item, name:ability + q.tier3.name}; 
    }
    let obj = {};
    obj["predefined-items"] = abilities;
    abilities = obj;
    
    // Upload prepared YAMLs
    ftp.connect({host: config.ftpHost, user: config.ftpUser, password: config.ftpPass}).then(() => {
      return ftp.put(ymlify(items), "plugins/MagicSpells/spellsSelfGenerated/spellSelfGen-Crate-Items.yml")
    }).then(() => {
      return ftp.put(ymlify(preview), "plugins/MagicSpells/spellsSelfGenerated/spellSelfGen-Crate-Preview.yml")
    }).then(() => {
      return ftp.put(ymlify(manage), "plugins/MagicSpells/spellsSelfGenerated/spellSelfGen-Quirk-Management.yml")
    }).then(() => {
      return ftp.put(ymlify(abilities), "plugins/MagicSpells/spellsSelfGenerated/spellSelfGen-Abilities.yml")
    }).then(() => {
      return ftp.end();
    });
  });
}

function trelloBuild() {
  fetch("https://api.trello.com/1/boards/KkKAXdZQ/lists?key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd").then(y => y.text()).then(body => {
    for(let l of JSON.parse(body)) {
      if(!l.name.includes("Quirks")) continue;
      request({
        method: "PUT",
        url: "https://api.trello.com/1/lists/" + l.id +"/closed",
        qs: {
          value: "true",
          key: "21008e4383cece1d9366d9132a8343fb",
          token: "805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd"
        }
      });
    }
  });
  fetch("https://api.trello.com/1/boards/KkKAXdZQ/lists?name=Quirks&pos=bottom&key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd",{method:"POST"});
  setTimeout(function () {
    fetch("https://api.trello.com/1/boards/KkKAXdZQ/lists?key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd").then(y => y.text()).then(body => {
      for(let l of JSON.parse(body)) {
        if(!l.name.includes("Quirks")) continue;
        let text;
        for(let q of require("./quirks.json")) {
          if(q.labels && q.labels.includes("5d7cc5bee4223a3c87fab625")) continue;
          text = (q.quirk ? "## Quirk: " + q.quirk : "") +
            (q.desc ? "\n**Description:** " + q.desc : "") +
            (q.tier1 ? "\n\n---\n### Tier 1\n- **" + q.tier1[0].name + ":** *" + q.tier1[0].desc + "*" +
              "\n- **" + q.tier1[1].name + ":** *" + q.tier1[1].desc + "*" +
              "\n- **" + q.tier1[2].name + ":** *" + q.tier1[2].desc + "*" : "") +
            (q.tier2 ? "\n\n---\n### Tier 2\n- **" + q.tier2.name + "** *" + q.tier2.desc + "*" : "") +
            (q.tier3 ? "\n\n---\n### Tier 3\n- **" + q.tier3.name + "** *" + q.tier3.desc + "*" : "") +
            "\n\n---" +
            (q.profile ? "\n- **Profile:** " + ["1","2","3"].map(t => t == q.profile ? "**" + t + "**" : t).join("/") : "") +
            (q.type ? "\n- **Quirk Type:** " + ["Mutant","Transformation","Emitter"].map(t => t == q.type ? "**" + t + "**" : t).join("/") : "") +
            (q.owner ? "\n- **Quirk Owner:** *" + q.owner + "*" : "") +
            (q.skins ? "\n- **Skins:** " + q.skins.map(t => "*" + t + "*").join(", ") : "");
          request({
            method: "POST",
            url: "https://api.trello.com/1/cards",
            qs: {
              idList: l.id,
              name: q.name,
              idLabels: q.idLabels ? q.idLabels.join(",") + ",5d7d4e762ed83c1da12a3496" : null,
              idMembers: q.members ? q.members.join(",") : null,
              desc: text,
              key: "21008e4383cece1d9366d9132a8343fb",
              token: "805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd"
            }
          });
        }
      }
    });
  },1000);
}

function rosterBuild() {
  fetch("https://api.trello.com/1/boards/YBbW2ZTP/lists?key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd").then(y => y.text()).then(body => {
    for(let l of JSON.parse(body)) {
      if(!l.name.includes("Quirks")) continue;
      request({
        method: "GET",
        url: "https://api.trello.com/1/lists/" + l.id + "/cards?fields=name",
        qs: {
          fields: "name,desc",
          key: "21008e4383cece1d9366d9132a8343fb",
          token: "805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd"
        }
      }, (e,r,body) => {
        var profile1 = [];
        var profile2 = [];
        var profile3 = [];
        var text;
        for(let c of JSON.parse(body)) {
          if(!c.desc) continue;
          text = c.desc.split("\n").filter(l => l.includes("**Profile:**"));
          if(!text[0]) continue;
          text = text[0].match(/\*\*([0-9]*)\*\*/)[1];
          if(!text) continue;
          if(text == "1") profile1.push("[" + c.name + "](https://trello.com/c/" + c.id + ")");
          if(text == "2") profile2.push("[" + c.name + "](https://trello.com/c/" + c.id + ")");
          if(text == "3") profile3.push("[" + c.name + "](https://trello.com/c/" + c.id + ")");
        }
        request({
          method: "PUT",
          url: "https://api.trello.com/1/cards/uEL55Rqn",
          qs: {
            desc: "**Profile 1:** " + profile1.join(", ") + "\n\n**Profile 2:** " + profile2.join(", ") + "\n\n**Profile 3:** " + profile3.join(", "),
            key: "21008e4383cece1d9366d9132a8343fb",
            token: "805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd"
          }
        })
      });
    }
  });
}



// Voice - Text handler
client.on("voiceStateUpdate", (oldState, newState) => {
  const config = jsonify("./files/config.yml");
  var vcText = Object.values(config["vcText"][newState.guild.id]);
  if(vcText) {
    var vcs = vcText.map(e => e.vc).reduce((e,v) => e.concat(v), []);
    if(vcs.includes(newState.channelID)) {
      vcText.find(c => c.vc.includes(newState.channelID)).text.forEach(c => client.channels.resolve(c).updateOverwrite(newState.id,{"VIEW_CHANNEL":true},"Joined channel with voice-text enabled."));
    }
    if(vcs.includes(oldState.channelID) && (!vcs.includes(oldState.channelID) || !newState.channelID)) {
      vcText.map(e => e.text).reduce((e,v) => e.concat(v), []).forEach(c => {
        var temp = client.channels.resolve(c);
        if(temp && temp.permissionOverwrites) {
          temp = temp.permissionOverwrites.get(oldState.id);
          if(temp) temp.delete("Left channel with voice-text enabled.");
        }
      });
    } 
  }
});



// Commands
client.on("message", async message => {
  const suggestions = require("./files/sugg.json");
  const config = jsonify("./files/config.yml");
  const modlist = jsonify("./files/modlist.yml");
  const warnings = jsonify("./files/warnings.yml");
  const linked = require("./files/linkedAccounts.json");
  const linkAttempt = require("./files/linkAccountsAttempt.json");
  var msg = message.content;
  var embed = embedPreset();
  // If its in DM create channel
  if(!message.guild) {
    if(message.author.id == client.user.id) return;
    if(!mainGuild.channels.find(c => c.name == message.author.id)) mainGuild.channels.create(message.author.id,{type:"text",parent:"575426875447443457"});
    setTimeout(() => {
      var userChannel = mainGuild.channels.find(c => c.name == message.author.id);
      if(userChannel.topic != message.author.username) userChannel.setTopic(message.author.username);
      if(isJSON(msg)) {
        userChannel.send("**" + message.author.username + " ▸** ");
        userChannel.send(JSON.parse(msg));
      }
      else userChannel.send("**" + message.author.username + " ▸** " + msg);
    },1000);
    return;
  }
  // Create prefix if it doesn't exist
  if(!config["cmdPrefix"][message.guild.id]) {
    var tempconfig = config;
    tempconfig["cmdPrefix"][message.guild.id] = "?";
    fs.writeFileSync("./files/config.yml", ymlify(tempconfig));
  }
  // Create responses if they don't exist
  if(!jsonify("./files/responses.yml")[message.guild.id]) {
    var tempresponses = jsonify("./files/responses.yml");
    tempresponses[message.guild.id] = {};
    fs.writeFileSync("./files/responses.yml", ymlify(tempresponses));
  }
  let responses = jsonify("./files/responses.yml")[message.guild.id];
  // If not command
  if(!msg.startsWith(config["cmdPrefix"][message.guild.id])) {
    if(message.channel.id == config.console) return;
    // If in minecraft channel
    if(message.channel.id == config.newMinecraft) {
      if(message.author.id == config.zatanna) return;
      if(!serverOnline) {textSend("Server Pinger","Server is currently offline. You cannot send messages to it.",message,5); return}
      let user = linked[message.author.id];
      if(!user) {textSend("Link Your Account","In order to use this channel you must link your account first!\nTo link it run this command ingame: **/link**",message,10); return}
      message.channel.send("**[D] " + user.username.replace(/(((&|§).)|(\[[0-9]*m))/g,"") + "▸** " + msg.replace(/(((&|§).)|(\[[0-9]*m))/g,""));
      message.delete();
      mcconsole("cmi ctellraw all <T>&0&l[&5Discord&0&l] </T><Next><T>" + user.username.replace(/§/g,"&") + "</T><SC><@" + message.author.id + "> </SC><H>&6Click to ping in Discord.</H><Next><T>&5▶ &7" + msg.replace(/(((&|§).)|(\[[0-9]*m))/g,"") + "</T>");
      return;
    }
    // If it's console feed
    if(message.channel.id == config.consoleFeed) {
      if(message.author.id != config.zatanna) return;
      // Split console messages in lines and process
      for(let m of msg.split("\n")) {
        msg = m;
        // Normal message
        if(m.includes("▶")) {
          msg = m.replace("INFO ","**").replace("▶","▸**").replace(/(((&|§).)|(\[[0-9]*m))/g,"");
          serverOnline = true;
        }
        // Afk system
        if(m.includes("[=]")) {
          serverOnline = true;
          let clock = ["1","2","3","4","5","6","7","8","9","10","11","12","130","230","330","430","530","630","730","830","930","1030","1130","1230"];
          msg = m.replace("INFO ","**")
            .replace("[=]",":clock" + clock[Math.floor(Math.random() * clock.length)] + ":")
            .replace("is no","**is no")
            .replace("entered Auto AFK","**entered **Auto AFK**")
            .replace("AFK.","**AFK**.")
            .replace(/(((&|§).)|(\[[0-9]*m))/g,"");
        }
        // Link detect
        if(m.includes(" issued server command: /link")) {
          let username = m.substring(5,m.indexOf(" issued"));
          mcconsole("papi parse " + username + " %player_uuid%|%cmi_user_prefix%%cmi_user_display_name%%cmi_user_suffix%",r => {
            if(Object.values(linkAttempt).includes(r)) {
              mcconsole("cmi msg " + username + " !-&bRun this command in any channel in our discord server&f: &6?link " + Object.keys(linkAttempt).find(key => linkAttempt[key] === r));
              return;
            }
            message.channel.send(r).then(mess => {
              let code = ("" + mess.id).substr(0,5);
              mess.delete();
              let attemptLink = linkAttempt;
              attemptLink[code] = r;
              fs.writeFileSync("./files/linkAccountsAttempt.json",JSON.stringify(attemptLink));
              mcconsole("cmi msg " + username + " !-&bStep complete! Now in any discord channel on our server run this exact command&f: &6?link " + code);
            });
          });
        }
        // Grab messages from DiscordSrv
        if(m.includes("loginMessageDetect")) {
          msg = m.substr(0,m.indexOf("login")).replace(/(((&|§).)|(\[[0-9]*m))/g,"");
          serverOnline = true;
          // Update username in linkedAccounts DB
          let splits = m.substr(m.indexOf("loginMessageDetect")+18).split("|");
          let user = Object.keys(linked).find(key => linked[key].uuid == splits[0]);
          // If user isn't linked, stop
          if(user) {
            mcconsole("papi parse " + splits[1] + " %cmi_user_prefix%%cmi_user_display_name%%cmi_user_suffix%",r => {
              let linkedAcc = linked;
              linkedAcc[user].username = r;
              fs.writeFileSync("./files/linkedAccounts.json",JSON.stringify(linkedAcc));
            });
          }
        }
        if(m.includes("logoutMessageDetect")) {
          msg = m.replace("logoutMessageDetect","").replace(/(((&|§).)|(\[[0-9]*m))/g,"");
          serverOnline = true;
          // Update username in linkedAccounts DB
          let splits = m.substr(m.indexOf("loginMessageDetect")+18).split("|");
          let user = Object.keys(linked).find(key => linked[key].uuid == splits[0]);
          // If user isn't linked, stop
          if(user) {
            mcconsole("papi parse " + splits[1] + " %cmi_user_prefix%%cmi_user_display_name%%cmi_user_suffix%",r => {
              let linkedAcc = linked;
              linkedAcc[user].username = r;
              fs.writeFileSync("./files/linkedAccounts.json",JSON.stringify(linkedAcc));
            });
          }
        };
        if(m.includes("deathMessageDetect")) { 
          msg = m.replace("deathMessageDetect","").replace(/(((&|§).)|(\[[0-9]*m))/g,"");
          serverOnline = true;
        }
        if(m.includes("detectStartupMessage")) {
          msg = m.replace("detectStartupMessage","").replace(/(((&|§).)|(\[[0-9]*m))/g,"");
          serverOnline = true;
        }
        if(m.includes("detectShutdownMessage")) {
          msg = m.replace("detectShutdownMessage","").replace(/(((&|§).)|(\[[0-9]*m))/g,"");
          serverOnline = false;
        }
        // Quirk List
        if(m.replace(/(((&|§).)|(\[[0-9]*m))/g,"").includes(" requested the quirk list from Zatanna.")) {
          mcconsole("cmi ctellraw all <T>&0&l[&5Discord&0&l] </T><Next><T>&dZatanna Zatara</T><H>&bNot pingable.</H><Next><T>&5▶ </T><Next><T>&4[&7Link&4]</T><H>&bClick to visit website. &7(Trello)</H><URL>https://trello.com/c/UWzURsQs/</URL>");
          return;
        }
        // Resourcepack Setting Log
        if(m.includes("detectPackSettingSelect")) {
          let username = m.substring(12,m.indexOf(" forced "));
          client.channels.resolve(config.resourcepackLog).send({embed:{description:"**" + username + "** changed their resourcepack setting to: **Select**."}})
          return;
        }
        if(m.includes("detectPackSettingAuto")) {
          let username = m.substring(12,m.indexOf(" forced "));
          client.channels.resolve(config.resourcepackLog).send({embed:{description:"**" + username + "** changed their resourcepack setting to: **Automatic**."}})
          return;
        }
        if(m.includes(" forced to cast detectQurikConstuct")) {
          constructQuirks();
          return;
        }
        // Send
        if(msg != m) minecraft(msg);
      }
      return;
    }
    // To-do list
    if(message.channel.id == config.toDoList) {
      if(msg.startsWith(config["cmdPrefix"][message.guild.id])) return;
      if(message.author.bot) return;
      message.channel.send("",{embed:{author:{name:message.author.username,icon_url:message.author.displayAvatarURL()},description:msg,color:Math.floor(Math.random()*16777215)}});
      message.delete();
      return;
    }
    // Webhook Redirects
    if(message.channel.parentID == "598449549232701443") {
      if(!message.webhookID) return;
      switch(message.channel.id) {
        // Changelog
        case "598449666962751492":
          client.channels.resolve(config.changelog).send(message.content ? message.content : "",toEmbedObj(message));
          break;
        // Staff App
        case "598460750532575233":
          client.channels.resolve(config.staffApp).send(message.content ? message.content : "",toEmbedObj(message));
          client.channels.resolve(config.staffAppReview).send(message.content ? message.content : "",toEmbedObj(message));
          break;
      }
    }
    // DM Channel reply
    if(message.channel.parentID == "575426875447443457") {
      if(msg.startsWith(config["cmdPrefix"][message.guild.id])) return;
      if(message.author.bot) return;
      if(msg.startsWith("!")) return;
      var user = client.users.resolve(message.channel.name);
      if(!user) {
        message.channel.delete("The bot is not in a mutual server with user.");
        logChannel.send(message.author.toString() + " Deleted channel `" + message.channel.name + "` **" + message.channel.topic + "** - bot has to be in a mutual server with user.");
      }
      else {
        if(message.channel.topic != user.username) message.channel.setTopic(user.username);
        if(isJSON(msg.replace(/`/g,""))) {
          user.send("",JSON.parse(msg.replace(/`/g,"")));
          message.channel.send("**" + message.guild.me.user.username + " ▸**");
          message.channel.send("",JSON.parse(msg));
        }
        else {
          user.send(msg);
          message.channel.send("**" + message.guild.me.user.username + " ▸** " + msg);
        }
        message.delete();
      }
      return;
    }
    // Kyo jojo meme
    if(msg.toLowerCase().includes("jojo") && message.mentions && message.mentions.members.array().length==1) {
      var member = message.mentions.members.array()[0];
      message.channel.createWebhook(member.nickname ? member.nickname : member.user.username,{avatar:member.user.displayAvatarURL(),reason:"Fake message command."}).then(w => w.send("no u").then(m => w.delete("Fake message sent.")));
      return;
    }
    // Trello card preview
    if(msg.includes("https://trello.com/c/")) {
      message.channel.send("",{embed:{color:13959423,description:"Show card preview?"}}).then(m => {
        m.react("👎");
        setTimeout(() => {m.react("👍")},100);
        setTimeout(() => {
          const collector = new Discord.ReactionCollector(m,r => r.emoji.name=="👍" || r.emoji.name=="👎",{time:10000});
          collector.on("collect", r => {
            if(r.emoji.name == "👎") {
              collector.stop();
              m.delete({timeout:1000});
            }
            if(r.emoji.name == "👍") {
              var index = msg.indexOf("/",msg.lastIndexOf("/c/")+3);
              if(index<0) index = msg.indexOf(" ",msg.lastIndexOf("/c/")+3);
              if(index<0) index = msg.length;
              fetch("https://api.trello.com/1/cards/" + msg.substring(msg.lastIndexOf("/c/")+3,index) + "?fields=desc&attachments=false&attachment_fields=all&members=false&membersVoted=false&checkItemStates=false&checklists=none&checklist_fields=all&board=false&list=false&pluginData=false&stickers=false&sticker_fields=all&customFieldItems=false&key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd").then(y => y.text()).then(body => {
                collector.stop("stop");
                textPrompt("Trello card preview",JSON.parse(body).desc,"\n",message,90000);
                m.delete();
              });
            }
          });
          collector.on("end", (collected, reason) => {if(reason != "stop") m.delete()});
        },1500);
      });
      return;
    }
    // Responses
    if(responses) {
      if(message.author.id == config.zatanna) return;
      
      //for(let response of responses) {
        //if(
          //(response.trigger.toLowerCase().startsWith("~") && msg.toLowerCase().includes(response.trigger.substring(1).toLowerCase())) ||
          //(response.trigger.toLowerCase().startsWith("§") && msg.toLowerCase().match(new RegExp(response.trigger.substring(1)))) ||
          //(msg.toLowerCase() == response.trigger.toLowerCase())
        //) {
          //message.channel.send("",isJSON(response.reply) ? JSON.parse(response.reply) : {content:response.reply});
          //return;
        //}
      //}
    }
    // Custom responses
    if(["<@" + message.guild.me.id + ">","<@!" + message.guild.me.id + ">"].includes(msg)) {
      textSend("","My prefix is: **" + config["cmdPrefix"][message.guild.id] + "**",message);
      return;
    }
    // Avoid prefix checking for these.
    // It actually checks for these in message and just turns the message into a command.
    if(
      msg.toLowerCase().includes(" ip") ||
      msg.toLowerCase().includes("!technic") ||
      msg.toLowerCase().includes("discord links")
    ) msg = config["cmdPrefix"][message.guild.id] + "server";
    if(
      msg.toLowerCase().includes("?quirk") ||
      msg.toLowerCase().includes("?quirks")
    ) msg = config["cmdPrefix"][message.guild.id] + "quirks";
    if(!msg.startsWith(config["cmdPrefix"][message.guild.id])) return;
  }
  const members = message.guild.members.array();
  var args = msg.slice(config["cmdPrefix"][message.guild.id].length).split(/ +/);
  const cmd = args.shift().toLowerCase();
  switch(cmd){
    case "help":
    case "commands":
      textPrompt("Command list","**Command prefix:** " + config["cmdPrefix"][message.guild.id] + "\n\n" + fs.readFileSync("./files/commands.txt").toString(),"\n**",message,90000);
      break;
    case "say":
    case "embed":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Say command help","Specify message or the channel the message will be sent to, then the message.\n",message,15); return;}
      var channel = client.channels.has(args[0]) ? client.channels.resolve(args.shift()) : message.channel;
      if(isJSON(args.join(" ").replace(/`/g,""))) channel.send("",JSON.parse(args.join(" ").replace(/`/g,"")));
      else channel.send(args.join(" "));
      message.delete();
      break;
    case "prefix":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Prefix help","Current prefix: **" + config["cmdPrefix"][message.guild.id] + "**\nTo change it you must specify a prefix as a parameter of this command.",message,15); return;}
      var tempconfig = config;
      config["cmdPrefix"][message.guild.id] = args[0];
      textSend("Change Prefix","Prefix set to: **" + args[0] + "**",message);
      fs.writeFileSync("./files/config.yml", ymlify(tempconfig));
      break;
    case "responses":
      let index = 1;
      text = "";
      if(responses.normal) {
        text += "\n\n__**Normal responses:**__"
        responses.normal.forEach(r => {text += "\n[**" + index + "**] \"" + r.trigger + "\" >> \"" + r.reply + "\""; index++});
      }
      if(responses.wildcard) {
        text += "\n\n__**Wildcard responses:**__ *(if triggers are found anywhere in the message)*"
        responses.wildcard.forEach(r => {text += "\n[**" + index + "**] \"" + r.trigger + "\" >> \"" + r.reply + "\""; index++});
      }
      if(responses.regex) {
        text += "\n\n__**Regex responses:**__ *(if regex passes)*"
        responses.regex.forEach(r => {text += "\n[**" + index + "**] \"" + r.trigger + "\" >> \"" + r.reply + "\""; index++});
      }
      if(!text) text = "No responses exist."
      text += "\n\n**Add responses by reacting with: ➕\nRemove them reacting with: ➖**\nRefresh by reacting with: 🔄";
      embed.embed.description = text;
      embed.embed.title = "Auto Responses";
      message.channel.send(embed).then(m => {
        let idle = true;
        m.react("➕");
        m.react("➖");
        m.react("🔄");
        let collector = m.createReactionCollector((r,u) => !u.bot,{time:90000});
        collector.on("collect", (r,u) => {
          if(!idle) {
            embed = embedPreset();
            embed.embed.title = "Auto Responses";
            embed.embed.description = "Somebody is currently editing the responses! Wait for them to finish.";
            embed.embed.color = 16711680;
            m.channel.send(embed).then(mes => mes.delete({timeout:3000}));
            r.users.remove(r.users.last());
            return;
          }
          if(!hasPerm(m.guild,m.guild.members.resolve(r.users.last()))) {
            embed = embedPreset();
            embed.embed.title = "Auto Responses";
            embed.embed.description = r.users.last() + ", you don't have permission.";
            embed.embed.color = 16711680;
            m.channel.send(embed).then(mes => mes.delete({timeout:3000}));
            r.users.remove(r.users.last());
            return;
          }
          switch(r.emoji.toString()) {
            case "➕":
              idle = false;
              embed = embedPreset();
              embed.embed.title = "Auto Response Creator";
              embed.embed.description = "What type of response should this be?\n:one: - **Normal** *(if the message matches the trigger)*\n:two: - **Wildcard** *(if the trigger is found anywhere in the message)*\n:three: - **Regex** *(if the regex passes for the message)*\n❌ - **Cancel**";
              m.channel.send(embed).then(m2 => {
                m2.react("1⃣");
                m2.react("2⃣");
                m2.react("3⃣");
                m2.react("❌");
                let collector2 = m2.createReactionCollector((r2,u2) => !u2.bot,{time:25000});
                collector2.on("collect", (r2,u2) => {
                  if(!hasPerm(m2.guild,m2.guild.members.resolve(r2.users.last()))) {
                    embed = embedPreset();
                    embed.embed.title = "Auto Responses";
                    embed.embed.description = r2.users.last() + ", you don't have permission.";
                    embed.embed.color = 16711680;
                    m2.channel.send(embed).then(mes => mes.delete({timeout:3000}));
                    r2.users.remove(r2.users.last());
                    return;
                  }
                  let choice = "";
                  switch(r2.emoji.toString()) {
                    case "1⃣":
                      choice = "Normal";
                      break;
                    case "2⃣":
                      choice = "Wildcard"
                      break;
                    case "3⃣":
                      choice = "Regex"
                      break;
                    case "❌":
                      collector2.stop();
                      break;
                  }
                  if(choice) {
                    embed = embedPreset();
                    embed.embed.title = "Auto Response Creator - " + choice;
                    if(choice=="Normal") embed.embed.description = "**Type the trigger that would be compared with the message.**\nIf the message is equal to the trigger, the reply will be sent.";
                    if(choice=="Wildcard") embed.embed.description = "**Type the trigger that would be compared with the message.**\nIf the message contains the trigger anywhere in the message, the reply will be sent.";
                    if(choice=="Regex") embed.embed.description = "**Type the trigger that would be compared with the message.**\nIf the message passes the regex condition, the reply will be sent.";
                    m2.channel.send(embed).then(m3 => {
                      let collector3 = m3.channel.createMessageCollector(msg => msg.author.id == u2.id,{time:20000});
                      collector3.on("collect", msg => {
                        collector3.stop();
                        embed.embed.description = "**Type the reply for this trigger.**";
                        m2.channel.send(embed).then(m3 => {
                          let collector4 = m3.channel.createMessageCollector(msg => msg.author.id == u2.id,{time:20000});
                          collector4.on("collect", msg2 => {
                            let tempresponses = jsonify("./files/responses.yml");
                            if(!responses[choice.toLowerCase()]) tempresponses[msg2.guild.id][choice.toLowerCase()] = [];
                            tempresponses[message.guild.id][choice.toLowerCase()].push({trigger:msg.content,reply:msg2.content})
                            fs.writeFileSync("./files/responses.yml", ymlify(tempresponses));
                            msg2.delete();
                            collector4.stop("created");
                          });
                          collector4.on("end", (coll,reason) => {
                            m3.delete();
                            collector2.stop(reason);
                          });
                        });
                        msg.delete();
                      });
                      collector3.on("end", (coll,reason) => {
                        m3.delete();
                      });
                    });
                  }
                  if(m2) r2.users.remove(r2.users.last());
                });
                collector2.on("end", (coll,reason) => {
                  m2.delete();
                  if(reason == "created") {
                    embed = embedPreset();
                    embed.embed.title = "Auto Response Creator";
                    embed.embed.description = "Response created.";
                    m.channel.send(embed).then(mes => mes.delete({timeout:3000}));
                  }
                  idle = true;
                  console.log("collector 2 stopped: " + reason)
                });
              });
              break;
            case "➖":
              idle = false;
              embed = embedPreset();
              embed.embed.title = "Auto Response Remover";
              embed.embed.description = "**Type the index of the response you want to remove. (multiple indexes can be specified)**";
              m.channel.send(embed).then(msg => {
                let collector = m.channel.createMessageCollector(m1 => m1.author.id == message.author.id,{time:10000});
                collector.on("end", (coll,reason) => {
                  msg.delete();  
                  idle = true;
                });
                collector.on("collect", m1 => {
                  let indexes = m1.content.match(/[0-9]+/g).sort((a,b) => a>b);
                  tempresponses = jsonify("./files/responses.yml");
                  if(!indexes) {
                    embed = embedPreset();
                    embed.embed.title = "Auto Response Remover";
                    embed.embed.description = "You need to send an idex of the response you want to remove. (the number)";
                    m1.channel.send(embed).then(mes => mes.delete({timeout:3000}));
                    m1.delete();
                  }
                  else {
                    text = "";
                    let i;
                    for(let index of indexes) {
                      i = index;
                      if(responses.normal && responses.normal.length >= index) {
                        tempresponses[m1.guild.id]["normal"] = tempresponses[m1.guild.id]["normal"].filter((r,ind) => ind != (parseInt(index)-1));
                        if(!tempresponses[m1.guild.id]["normal"][0]) delete tempresponses[m1.guild.id]["normal"];
                        text += "\nResponse `" + i + "` deleted.";
                        continue;
                      }
                      else if(responses.normal) index -= responses.normal.length;
                      if(responses.wildcard && responses.wildcard.length >= index) {
                        tempresponses[m1.guild.id]["wildcard"] = tempresponses[m1.guild.id]["wildcard"].filter((r,ind) => ind != (parseInt(index)-1));
                        if(!tempresponses[m1.guild.id]["wildcard"][0]) delete tempresponses[m1.guild.id]["wildcard"];
                        text += "\nResponse `" + i + "` deleted.";
                        continue;
                      }
                      else if(responses.wildcard) index -= responses.wildcard.length;
                      if(responses.regex && responses.regex.length >= index) {
                        tempresponses[m1.guild.id]["regex"] = tempresponses[m1.guild.id]["regex"].filter((r,ind) => ind != (parseInt(index)-1));
                        if(!tempresponses[m1.guild.id]["regex"][0]) delete tempresponses[m1.guild.id]["regex"];
                        text += "\nResponse `" + i + "` deleted.";
                        continue;
                      }
                      else text += "\nResponse `" + i + "` couldn't be found.";
                    }
                  }
                  m1.delete();
                  embed = embedPreset();
                  embed.embed.title = "Auto Response Remover";
                  embed.embed.description = text;
                  m.channel.send(embed).then(mes => mes.delete({timeout:5000}));
                  fs.writeFileSync("./files/responses.yml", ymlify(tempresponses));
                  collector.stop();
                });
              });
              break;
            case "🔄":
              embed = toEmbedObj(m);
              index = 1;
              text = "";
              responses = jsonify("./files/responses.yml")[message.guild.id];
              if(responses.normal) {
                text += "\n\n__**Normal responses:**__"
                responses.normal.forEach(r => {text += "\n[**" + index + "**] \"" + r.trigger + "\" >> \"" + r.reply + "\""; index++});
              }
              if(responses.wildcard) {
                text += "\n\n__**Wildcard responses:**__ *(if triggers are found anywhere in the message)*"
                responses.wildcard.forEach(r => {text += "\n[**" + index + "**] \"" + r.trigger + "\" >> \"" + r.reply + "\""; index++});
              }
              if(responses.regex) {
                text += "\n\n__**Regex responses:**__ *(if regex passes)*"
                responses.regex.forEach(r => {text += "\n[**" + index + "**] \"" + r.trigger + "\" >> \"" + r.reply + "\""; index++});
              }
              if(!text) text = "No responses exist."
              text += "\n\n**Add responses by reacting with: ➕\nRemove them reacting with: ➖**\nRefresh by reacting with: 🔄";
              embed.embed.description = text;
              m.edit(embed);
              break;
          }
          r.users.remove(r.users.last());
        });
        collector.on("end", (coll,reason) => {
          m.reactions.removeAll();
          embed = toEmbedObj(m);
          embed.embed.description = embed.embed.description.substr(0,embed.embed.description.lastIndexOf("**Add")-5);
          m.react("❤");
        });
      });
      break;
    case "welcome":
      textSend("Current welcome DM",fs.readFileSync("./files/welcome.txt").toString(),message);
      break;
    case "roles":
      const roles = message.guild.roles.array();
      roles.shift();
      var text = "";
      roles.forEach(r => {text += r.toString() + " `<@&" + r.id + ">`(members: " + message.guild.roles.resolve(r.id).members.map(m => m.user.tag).length + ")\n"});
      textPrompt("Role list",text,"\n",message,90000);
      break;
    case "roleinfo":
      if(!args[0]) {textSend("Role info help","You must specify a role to show info of.",message,15); break;}
      var role = findRole(message.guild,args.join(" "));
      if(!role) {textSend("Role info help","Role not found.",message,15); break;}
      textSend("Role information of input: " + args[0],"**Position:** " + role.position + "\n**Color:** " + role.hexColor + "\n**Created at:** " + role.createdAt.toLocaleString() + "\n**Hoistable:** " + role.hoist + "\n**ID:** `<@&" + role.id + ">`\n**Members:** " + role.members.map(m => m.user.tag).length + "\n**Mentionable:** " + role.mentionable + "\n**Name:** " + role.name + "\n**Menitoned:** " + role.toString(),message);
      break;
    case "rolecolor":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Role color help","You must specify a role.",message,15); break;}
      if(!args[1]) {textSend("Role color help","You must specify a color to set the role to.",message,15); break;}
      if(parseInt(args[1],16)>16777215) {textSend("Role color help","Color must be hexadecimal. Use a [color picker](https://www.google.hr/search?q=hex+color+picker&oq=hex+co&aqs=chrome.0.69i59j69i57j69i60l3j0.3191j0j7&sourceid=chrome&ie=UTF-8).",message.channel); break;}
      var role = findRole(message.guild,args[0]);
      if(!role) {textSend("Role color help","Role not found.",message,15); break;}
      role.setColor(args[1]);
      textSend("Role color","Role color for role **" + role.toString() + "** has been set to **#" + args[1].toString(16) + "**",message,0,parseInt(args[1],16))
      break;
    case "setnick":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Set nickname help","You must specify a user.",message,15); break;}
      if(!args[0]) {textSend("Set nickname help","You must specify a new nickname to set.",message,15); break;}
      var member = findGuildMember(message.guild,args[0]);
      if(!member) {textSend("Set nickname help","User not found.",message,15); break;}
      args.shift();
      member.setNickname(args.join(" "));
      textSend("Nickname","**" + member.user.username + "**'s nickname set to **" + args.join(" ") + "**.",message)
      break;
    case "role":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Toggle role help","You must specify a user.",message,15); break;}
      if(!args[1]) {textSend("Toggle role help","You must specify at least one role.",message,15); break;}
      var member = findGuildMember(message.guild,args[0]);
      if(!member) {textSend("Toggle role help","User not found.",message,15); break;}
      if(!member.manageable) {textSend("","Cannot modify that user.",message,15,16711680); break;}
      args.shift();
      var list = args.join(" ").split(",");
      list.forEach(e => {if(e.startsWith(" ")) e = e.substring(1)});
      var text = "**Editing user " + member.toString() + ":**";
      list.forEach(e => {
        var role = findRole(message.guild,e.replace(/ /g,""));
        if(!role) {
          text += "\n**-** '" + e + "' role was not found.";
          return;
        }
        if(member.roles.has(role.id)) {
          text += "\n**-** " + role.toString();
          member.roles.remove(role.id).catch(()=>{}).then(m => {if(m.roles.has(role.id)) text += "  `Error: Missig Permissions`"});
        }
        else {
          text += "\n**+** " + role.toString();
          member.roles.add(role.id).catch(()=>{}).then(m => {if(!m.roles.has(role.id)) text += "  `Error: Missig Permissions`";});
        }
      });
      textSend("Role",(text == "Editing user **" + member.user.username + "**:") ? "Roles you specified do not exist." : text,message);
      break;
    case "rolename":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Role name help","You must specify a role.",message,15); break;}
      if(!args[1]) {textSend("Role name help","You must specify the new name for the role.",message,15); break;}
      var role = findRole(message.guild,args[0]);
      if(!role) {textSend("Role name help","Role not found.",message,15); break;}
      role.setName(args.join(" "),"Edited by user '" + message.author.username + "'.");
      textSend("Role name","Role name for role **" + role.toString() + "** has been set to **" + args.join(" ") + "**",message);
      break;
    case "clean":
    case "delete":
    case "purge":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Purge help","**Parameters:**\nhas (*word*) (*number*)\nbyuser (*user id*) (*number*)\n(*number*)",message,20); break;}
      switch(args[0]) {
        case "has":
          if(!args[1]) {textSend("Purge help","Specify word to look for.",message,15); break;}
          if(!args[2]) {textSend("Purge help","Specify number of messages to look for.",message,15); break;}
          message.channel.messages.fetch({"limit":parseInt(args[2])+1}).then(m => message.channel.bulkDelete(m.array().filter(mes => mes.content.includes(args[1]))));
          break;
        case "byuser":
          if(!args[1]) {textSend("Purge help","Specify user to look for.",message,15); break;}
          if(!args[2]) {textSend("Purge help","Specify number of messages to look for.",message,15); break;}
          if(args[1].includes("<")) {
            args[1] = args[1].substring(2,args[1].length-1);
            if(args[1].includes("!")) args[1] = args[1].substring(1);
          }
          message.channel.messages.fetch({"limit":parseInt(args[2])+1}).then(m => message.channel.bulkDelete(m.array().filter(mes => mes.author.id == args[1])));
          break;
        default:
          message.channel.bulkDelete(parseInt(args[0])+1);
          break;
      }
      if(message) message.delete();
      break;
    case "kill":
    case "kick":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Kick help","Specify user to kick. Reason is optional.\n**Parameters:** [user] (reason)",message,20); break;}
      var member = findGuildMember(message.guild,args[0]);
      if(!member) {textSend("Kick help","User not found.",message,15); break;}
      if(!member.kickable) {textSend("","Cannot modify that user.",message,15,16711680); break;}
      args.shift();
      var reason = "**" + member.user.username + "** has been kicked from the server by user: " +  message.author.toString();
      reason = args[0] ? reason + "\n**For reason:** " + args.join(" ") : reason;
      textSend("User kicked",reason,message,0,16711680);
      message.delete();
      reason = member.user.username + " has been kicked from the server by user: " + message.author.username;
      reason = args[0] ? reason + "\nFor reason: " + args.join(" ") : reason;
      member.kick(reason);
      break;
    case "ban":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Ban help","Specify user to ban. Reason is optional.\n**Parameters:** [user] (reason)",message,15); break;}
      var member = findGuildMember(message.guild,args[0]);
      if(!member.bannable) {textSend("","Cannot modify that user.",message,15,16711680); break;}
      if(!member) {textSend("Ban help","User not found.",message,15); break;}
      args.shift();
      var reason = "**" + member.user.username + "** has been banned from the server by user: " +  message.author.toString();
      reason = args[0] ? reason + "\n**For reason:** " + args.join(" ") : reason;
      textSend("User banned",reason,message,0,16711680);
      message.delete();
      reason = member.user.username + " has been banned from the server by user: " + message.author.username;
      reason = args[0] ? reason + "\nFor reason: " + args.join(" ") : reason;
      member.ban(reason);
      break;
    case "unban":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Unban help","Specify user to unban.",message,15); break;}
      var member = findGuildMember(message.guild,args[0]);
      if(!member) {textSend("Unban help","User not found.",message,15); break;}
      textSend("User unbanned","**" + member.user.username + "** has been unbanned by user: **" +  message.author.username + "**",message,0,65280);
      message.delete();
      message.guild.unban(member);
      break;
    case "members":
      var role;
      if(!args[0]) role = message.guild;
      else role = findRole(message.guild,args.join(" "));
      if(!role) {textSend("Members help","Role not found.", message,15); break;}
      const members = message.guild.roles.resolve(role.id).members.array();
      textPrompt("Role members","Members of " + role.toString() + " role: **" + members.length + "**\n" + members.join(", "),", ",message,90000);
      break;
    case "avatar":
      var member = !args[0] ? message.member : findMember(args[0]).member;
      if(!member) {textSend("Avatar help","User not found.",message,15); break;}
      embed.embed.title = "**" + member.user.username + "**'s avatar";
      embed.embed.image.url = member.user.displayAvatarURL({format:"png",size:2048});
      message.channel.send("",embed);
      break;
    case "user":
    case "whois":
    case "userinfo":
      if(args[0]) {
        if(findMember(args[0])) var {member, guild} = findMember(args[0]);
        else {textSend("User info help","User not found.",message,15); break;}
      }
      else member = message.member;
      let thisGuild = true;
      list = member.guild.members.resolve(member).roles.array().filter(r => r.id != member.guild.id);
      let usernames = jsonify("./files/usernameDB.yml")[member.id];
      if(args[0] && member.guild.id != message.guild.id) thisGuild = false;
      embed.embed.title = "User info";
      embed.embed.thumbnail.url = member.user.displayAvatarURL();
      embed.embed.description = (thisGuild ? "" : "**Found in mutual guild:** " + guild.name) + "\n**Mention:** <@" + member.id + ">\n**ID:** " + member.id + "\n**Joined at:** " + member.joinedAt.toLocaleString() + "\n**Join Position:** " + member.guild.members.sort((a,b) => a.joinedAt-b.joinedAt).array().findIndex(m => m.id == member.id) + "\n**Registered at:** " + member.user.createdAt.toLocaleString() + (member.nickname ? "\n**Nickname:** " + member.nickname : "") + "\n**Status:** " + member.presence.status + (member.presence.game ? "\n**Playing game:** *" + member.presence.game : "") + "\n**Roles (" + list.length + ")**: " + (thisGuild ? list.join(", ") : list.map(r => "**" + r.name + "**").join(", ")) + (usernames ? "\n**Past Usernames:**" + usernames.map(u => "\n- [`" + new Date(u.time).toLocaleString() + "`] **" + u.username + "**") : "");
      message.channel.send("",embed);
      break;
    case "serverinfo":
      embed.embed.title = "Server information";
      var textChannels = message.guild.channels.array().filter(c => c.type == "text");
      var voiceChannels = message.guild.channels.array().filter(c => c.type == "voice");
      embed.embed.description = "**Text Channels (" + textChannels.length + "):** " + textChannels.join(", ") + "\n**Voice Channels (" + voiceChannels.length + "):** " + voiceChannels.join(", ") + "\n**Created at:** " + message.guild.createdAt.toLocaleString() + "\n**Guild ID:** " + message.guild.id + "\n**Guild Large:** " + message.guild.large + "\n**Member count:** " + message.guild.memberCount + "\n**Name:** " + message.guild.name + " (" + message.guild.nameAcronym + ")\n**Guild owner:** " + message.guild.owner.toString() + "\n**Region:** " + message.guild.region + "\n**Verified:** " + message.guild;
      embed.embed.thumbnail.url = message.guild.iconURL();
      message.channel.send("",embed);
      break;
    case "remmod":
      if(!message.member.hasPermission("ADMINISTRATOR")) {embed.embed.color = 16711680; embed.embed.description = "Missing permissions."; return;}
      if(!args[0]) {textSend("Remove mod help","After command mention a role.",message,15); break;}
      var role = findRole(message.guild,args[0]);
      if(!role) {textSend("Remove mod help","Role does not exist.",message,15); break;}
      var tempconfig = modlist;
      tempconfig["mods"][message.guild.id] = modlist["mods"][message.guild.id].filter(m => role.id != m);
      fs.writeFileSync("./files/modlist.yml", ymlify(tempconfig));
      textSend("","**New mods list:** " + modlist["mods"][message.guild.id].map(mods => "<@&"+mods+">").join(", "),message);
      break;
    case "addmod":
      if(!message.member.hasPermission("ADMINISTRATOR")) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Add mod help","After command mention at least one role or more seperated by spaces not commas.",message,15); break;}
      for(var i=0;i<args.length;i++) if(!findRole(message.guild,args[i])) args.splice(i,i);
      if(!args[0]) {textSend("Add mod help","Roles do not exist.",message,15); break;}
      args = args.map(a => findRole(message.guild,a).id);
      var tempconfig = modlist;
      if(tempconfig["mods"][message.guild.id]) args = args.concat(modlist["mods"][message.guild.id]);
      tempconfig["mods"][message.guild.id] = args;
      fs.writeFileSync("./files/modlist.yml", ymlify(tempconfig));
      textSend("","**New mods list:** " + modlist["mods"][message.guild.id].map(mods => "<@&"+mods+">").join(", "),message);
      break;
    case "modlist":
      textSend("Current mods list",!modlist["mods"][message.guild.id] ? "Mod list is empty. Add mod roles using the **addmod** command." : modlist["mods"][message.guild.id].map(mods => "<@&"+mods+">").join(", "),message);
      break;
    case "warn":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Warn help","Specify user to Warn. Reason is optional.\n**Parameters:** [user] (reason)",message,20); break;}
      var member = findGuildMember(message.guild,args.shift());
      if(!member) {textSend("Warn help","User not found.",message,15); break;}
      if(hasPerm(message.guild,member) && !hasAdminPerm(message.guild,message.member)) {textSend("","That user is a moderator.",message,0,16711680); break;}
      var reason = args ? args.join(" ") : "";
      textSend("Warning user",reason ? member.toString() + " has been warned by " + message.author.toString() + " for reason: ***" + reason + "***" : member.toString() + " has been warned.",message);
      message.delete();
      var warns = warnings;
      if(!warns[message.guild.id]) warns[message.guild.id] = {};
      warns[message.guild.id][Object.keys(warns[message.guild.id]).length] = {user:member.id,date:new Date().toLocaleString(),mod:message.member.id,reason:reason};
      fs.writeFileSync("./files/warnings.yml", ymlify(warns));
      embed = embedPreset();
      embed.embed.color = 16711680;
      embed.embed.title = message.guild.name;
      embed.embed.description  = "You have been warned for reason: ***" + reason + "***";
      member.send(embed);
      break;
    case "clearwarn":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Warn Clear help","Specify a case or user to clear.\n\nCase clears only that warning and must be specified prefixed with a '#'. **Example:** *clearwarn #52*\nIf you specify user it will clear all warns of that user.",message.channel); break;}
      var warns = warnings;
      if(args[0].startsWith("#")) {
        if(args[0].length < 2 || args[0] > Object.keys(warns[message.guild.id]).length-1) {textSend("Warn Clear help","Case invalid. Specify case number after '#'.",message,20); break;}
        textSend("Warn clear","Warning case **" + args[0] + "** has been cleared.",message);
        delete warns[message.guild.id][args[0].substring(1)];
      }
      else {
        var member = findGuildMember(message.guild,args.join(" "));
        if(!member) {textSend("Warn Clear help","User not found.",message,15); break;}
        Object.values(warns[message.guild.id]).forEach((c,i) => {if(c.user == member.id) delete warns[message.guild.id][i]});
        textSend("Warn clear","Warnings of user " + member.toString() + " have been cleared.",message);
      }
      var obj = {};
      Object.values(warns[message.guild.id]).forEach((c,i) => obj[i] = {user:c.user,date:c.date,mod:c.mod,reason:c.reason});
      warns[message.guild.id] = obj;
      fs.writeFileSync("./files/warnings.yml", ymlify(warns));
      break;
    case "warnings":
    case "warns":
      if(!warnings[message.guild.id]) {textSend("Warnings","There are no warnings.",message,15); return;}
      var text = "";
      var user = "";
      Object.values(warnings[message.guild.id]).forEach((c,i) => {
        if(user != c.user) {
          user = c.user;
          text += "\n\n**User** <@" + c.user + "> [**" + Object.values(warnings[message.guild.id]).map(cas => {if(cas.user == user) return cas}).filter(e => e).length + "**]:";
        }
        text += "\n**Case __#" + i + "__ (Mod: <@" + c.mod + ">)** [`" + c.date + "`]: " + c.reason;
      });
      textPrompt("Warnings",text,"**User",message,90000);
      break;
    case "quirks":
      fetch("https://api.trello.com/1/cards/UWzURsQs?fields=desc&key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd").then(y => y.text()).then(body => {
        embed.embed.title = "Quirk List";
        embed.embed.description = JSON.parse(body).desc;
        embed.embed.url = "https://trello.com/c/UWzURsQs/";
        message.channel.send("",embed);
      });
      if(message.channel.id == config.minecraft) client.channels.resolve(config.console).send('minecraft:tellraw @a ["",{"text":"[","bold":true,"color":"black"},{"text":"Discord ","color":"blue"},{"text":"Bot","color":"dark_purple"},{"text":"] ","bold":true,"color":"black"},{"text":"Zatanna Zatara","color":"light_purple"},{"text":"\u25b6 "},{"text":"[","color":"dark_red","clickEvent":{"action":"open_url","value":"https://trello.com/c/UWzURsQs/59-quirk-roster-list"}},{"text":"LINK","color":"gray","clickEvent":{"action":"open_url","value":"https://trello.com/c/UWzURsQs/59-quirk-roster-list"}},{"text":"]","color":"dark_red","clickEvent":{"action":"open_url","value":"https://trello.com/c/UWzURsQs/59-quirk-roster-list"}}]');
      break;
    case "taken":
    case "characters":
    case "takencharacters":
    case "takenchars":
      fetch("https://api.trello.com/1/cards/9qhuraUB?fields=desc&key=21008e4383cece1d9366d9132a8343fb&token=805f0bdd4a00c438573231c405741766b27c716430b6ca13f53e7ab50bb745bd").then(y => y.text()).then(body => {
        textPrompt("List of taken characters","Trello card link: **[Taken Characters](https://trello.com/c/9qhuraUB/60-currently-taken-characters)**\n\n" + JSON.parse(body).desc.replace(/---/g,"").replace(/###/g,"**").replace(/\n#/g,"__***").replace(/#/g,"***__"),"\n-",message,90000)
      });
      break;
    case "mute":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0] || !args[1]) {textSend("Mute help","Specify user to mute and the time to mute them for.\n**Parameters:** [user] [time]",message,20); break;}
      var member = findGuildMember(message.guild,args[0]);
      if(!member) {textSend("Mute help","User not found.",message,15); break;}
      textSend("User muted","**" + member.user.username + "** has been muted by user: **" +  message.author.username + "** for **" + ms(ms(args[1]),{long:true}) + "**.",message,0,16711680);
      message.delete();
      member.roles.add(config.mutedRole);
      embed.embed.title = message.guild.name;
      embed.embed.description  = "You have been muted by user: **" +  message.author.username + "** for **" + ms(ms(args[1]),{long:true}) + "**.";
      member.send("",embed);
      setTimeout(() => {
        member.role.remove(config.mutedRole);
        embed.embed.title = message.guild.name;
        embed.embed.description  = "You have been unmuted.";
      },ms(args[1]));
      break;
    case "unmute":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Unmute help","Specify user to unmute.",message,15); break;}
      var member = findGuildMember(message.guild,args[0]);
      if(!member) {textSend("Unmute help","User not found.",message.channel); break;}
      if(!member.roles.has(config.mutedRole)) {textSend("Unmute help","User not muted.",message,15); break;}
      textSend("User unmuted","**" + member.user.username + "** has been unmuted.",message,0,16711680);
      message.delete();
      member.role.remove(config.mutedRole);
      embed = embedPreset();
      embed.embed.title = message.guild.name;
      embed.embed.description  = "You have been unmuted.";
      member.send("",embed);
      break;
    case "love":
    case "lovecalc":
    case "ship":
      if(!args[1]) {textSend("","You must specify two users to ship.",message,20); break;}
      var member1 = findMember(args[0]).member;
      if(!member1) {textSend("","User not found.",message,15); break;}
      var member2 = findMember(args[1]).member;
      if(!member2) {textSend("","User not found.",message,15); break;}
      var real = true;
      var neg = "";
      embed.embed.title = "Shipping";
      var temp = null;
      if(member1 == member2) {
        embed.embed.description = "**.**";
        message.channel.send("",embed).then((msg) => {
          setTimeout(() => {
            embed.embed.description = "**.**   **.**";
            msg.edit("",embed);
            setTimeout(() => {
              embed.embed.description = "**.**   **.**   **.**";
              msg.edit("",embed);
              setTimeout(() => {
                embed.embed.description = "That poor soul.";
                embed.embed.color = 15872562;
                embed.embed.title = ":revolving_hearts::hearts::two_hearts: Shipping :two_hearts::hearts::revolving_hearts:";
                msg.edit("",embed);
                message.channel.stopTyping(true);
              },1000);
            },1000);
          },1000);
        });
        break;
      }
      // if either is ray
      if([member1.id,member2.id].includes("462712474353926174")) {
        temp = "-666%";
      }
      // if ray and jelly
      if(([member1.id,member2.id].includes("462712474353926174")) && ([member1.id,member2.id].includes("155791290099826689"))) {
        temp = "-69%";
      }
      // if either is kyo
      if([member1.id,member2.id].includes("321386112448856064")) {
        neg="-";
      }
      // if zatanna and tesla
      if(([member1.id,member2.id].includes(config.zatanna)) && ([member1.id,member2.id].includes("192710597106728960"))) {
        temp = "infinite";
      }
      if(!temp) {
        var a = member1.id;
        var b = member2.id;
        var sumA = 0;
        var sumB = 0;
        a = a.replace(/0/g,"");
        temp = a.length;
        var temp2 = parseInt(a.substring(a.length-1));
        if(temp2 == 0) temp2 = 1;
        while(a.length > 1) {
          a = a.replace(/0/g,"");
          sumA+=parseInt(a.substring(a.length-1))%10;
          a = a.substring(0,a.length-1);
        }
        a = sumA*temp*temp2;
        b = b.replace(/0/g,"");
        temp = b.length;
        temp2 = parseInt(b.substring(b.length-1));
        if(temp2 == 0) temp2 = 1;
        while(b.length > 1) {
          b = b.replace(/0/g,"");
          sumB += parseInt(b.substring(b.length-1))%10;
          b = b.substring(0,b.length-1);
        }
        b = sumB*temp*temp2;
        temp = a>b ? (b/a*100).toPrecision(3) : (a/b*100).toPrecision(3);
        if(neg == "-") temp="-" + temp;
        temp +="%";
      }
      embed.embed.description = "I swear that I'm up to no good.";
      message.channel.send("",embed).then((msg) => {
        setTimeout(() => {
          embed.embed.description = "**.**";
          msg.edit("",embed);
          setTimeout(() => {
            embed.embed.description = "**.**   **.**";
            msg.edit("",embed);
            setTimeout(() => {
              embed.embed.description = "**.**   **.**   **.**";
              msg.edit("",embed);
              setTimeout(() => {
                embed.embed.description = "Love between **" + member1.user.username + "** and **" + member2.user.username + "** is: ***" + temp + "***";
                embed.embed.color = 15872562;
                embed.embed.title = ":revolving_hearts::hearts::two_hearts: Shipping :two_hearts::hearts::revolving_hearts:";
                msg.edit("",embed);              
                message.channel.stopTyping(true);
              },1000);
            },1000);
          },1000);
        },1);
      });
      break;
    case "pickle":
      if(!args[0]) {textSend("","You must specify a user to \"inspect\".",message,20); break;}
      var member = findMember(args[0]).member;
      if(!member) {textSend("","Victim not found.",message,15); break;}
      var user = member.id;
      var sum = 0;
      user = user.replace(/0/g,"");
      var temp = user.length;
      var temp2 = parseInt(user.substring(user.length-1));
      if(temp == 0) temp = 1;
      while(user.length > 1) {
        user = user.replace(/0/g,"");
        sum += parseInt(user.substring(user.length-1))%10;
        user = user.substring(0,user.length-1);
      }
      user = "***" + (sum*temp2/temp).toPrecision(3) + "cm***";
      if(member.user.bot) user="🥺";
      if(member.id == "232578474181787648") user = "***" + 0.1 + "cm***";
      if(member.id == "462712474353926174") user = " too sandy to calculate.";
      embed.embed.description = "I swear, this is not legal...";
      message.channel.send("",embed).then((msg) => {
        setTimeout(() => {
          embed.embed.description = "🔎";
          msg.edit("",embed);
          setTimeout(() => {
            embed.embed.description = "🔎  🔎";
            msg.edit("",embed);
            setTimeout(() => {
              embed.embed.description = "🔎  🔎  🔎";
              msg.edit("",embed);
              setTimeout(() => {
                embed.embed.description = "**" + member.toString() + "**'s pickle size is " + user;
                embed.embed.color = 15872562;
                embed.embed.title = "🔎 🔎 Calculated 🔍 🔍";
                msg.edit("",embed);              
                message.channel.stopTyping(true);
              },1000);
            },1000);
          },1000);
        },1);
      });
      break;
    case "join":
      if(!message.member.voice.channel) {textSend("","You must be in a voice channel.",message,15); break;}
      message.member.voice.channel.join();
      message.delete();
      break;
    case "dc":
    case "leave":
      if(!message.guild.me.voice.channel) {message.react("❌"); setTimeout(() => {message.delete()},2500); break;}
      message.guild.me.voice.setChannel(null);
      message.delete();
      break;
    case "ray":
      if(!message.member.voice.channel) {textSend("","You must be connected to a voice chat.",message,10); break;}
      if(message.guild.me.voice.connection) {
        if(message.guild.me.voice.connection.dispatcher) {textSend("","I'm already playing something.",message,10); break;}
      }
      else message.member.voice.channel.join();
      const url = ["SizKbBP0h2k","OLrVZKV-T0M","IvX-vk10Umw","SyupRKeqd1c","DhdEFgoJ3RA"];
      setTimeout(() => {
        const dispatcher = message.guild.me.voice.connection.play(ytdl("https://www.youtube.com/watch?v=" + url[Math.floor(Math.random()*Math.floor(url.length))],{quality:"highestaudio"}));
        dispatcher.setVolume(2);
        dispatcher.on("end", () => message.guild.me.voice.setChannel(null));
      },500);
      break;
    case "tts":
      if(!args[0]) {textSend("","Specify text to read :/",message,15); break;}
      if(!message.member.voice.channel) {textSend("","You're not connected to a voice channel.",message,15); break;}
      if(message.guild.me.voice.connection) {
        if(message.guild.me.voice.connection.dispatcher) {textSend("","Something is already playing. Try again when it stops.",message,15); break;}
      }
      else message.member.voice.channel.join();
      setTimeout(() => {
        const dispatcher = message.guild.me.voice.connection.play("async:cache:http://api.voicerss.org/?key=f2c3cc8fafa74c5396c588bb661d5424&hl=en-gb&c=WAV&f=44khz_16bit_stereo&src=" + encodeURIComponent(args.join(" ")));
        dispatcher.setVolume(2);
        dispatcher.on("end", () => {
          message.guild.me.voice.setChannel(null);
          message.delete({timeout:1000});
        });
      },500);
      author.send(args.join(" "));
      break;
    case "ip":
    case "server":
      message.channel.startTyping();
      fetch("https://api.mcsrvstat.us/2/" + (args[0] ? args[0] : config.serverDefault)).then(y => y.text()).then(body => {
        if(!isJSON(body)) return;
        var server = JSON.parse(body);
        var text = "";
        var dns;
        if(server.debug && server.debug.dns && server.debug.dns.srv && server.debug.dns.srv[0] && server.debug.dns.srv[0].host) {
          dns = server.debug.dns.srv[0].host;
          dns = dns.substr(dns.indexOf(".",dns.lastIndexOf("_"))+1);
        }
        text += "**IP:** `" + (server.hostname ? (dns ? dns : server.hostname) : server.ip + (server.port ? ":" + server.port : "")) + "`";
        if(server.version) text += "\n**Server Version:** " + server.version;
        if(server.software) text += "\n**Software:** " + server.software;
        text += "\n**Online:** " + server.online;
        if(server.players) if(server.players.list) text += "\n**Online Players (" + server.players.online + "/" + server.players.max + "):** " + server.players.list.join(", ");
        if(server.map) text += "\n**Main World:** " + server.map;
        if(server.debug && server.debug.srv) text += "\n**SRV Protocol:** " + server.debug.srv;
        if(server.mods) text += "\n**Mods:** " + server.mods.names.join(", ");
        if(server.plugins) text += "\n**Plugins (" + server.plugins.raw.length + "):** " + server.plugins.raw.join(", ");
        textPrompt("Minecraft Server Info",text,",",message,90000,(server.online == true) ? 65353 : 16711680,true,server.icon ? server.icon : "");
      });
      break;
    case "msg":
      if(!args[0]) {textSend("","Specify user to fake message as.",message,10); break;}
      var member = findMember(args.shift()).member;
      if(!member) {textSend("","User not found.",message,15); break;}
      if(!args[0]) {textSend("","Specify message to send.",message,10); break;}
      message.channel.createWebhook(member.nickname ? member.nickname : member.user.username,{avatar:member.user.displayAvatarURL(),reason:"Fake message command."}).then(w => w.send(args.join(" ")).then(m => w.delete("Fake message sent.")));
      message.delete();
      break;
    case "youtube":
    case "yt":
      if(!args[0] || !args.join(" ").match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/./g)) {textSend("","You must specify a youtube link to download from.",message,5); break;}
      var video = await youtube.getVideo(args.join(" "));
      embed.embed.title = "**" + video.title + "**";
      embed.embed.url = "https://youtu.be/" + video.raw.id;
      embed.embed.description = "Click below to download.\n\n**[Click Here](https://video.genyt.net/" + video.raw.id +")**\n\n**Requested by:** " + message.author.toString();
      embed.embed.thumbnail.url = video.thumbnails.high.url;
      embed.embed.color = Math.floor(Math.random()*16777215);
      message.channel.send("",embed);
      message.delete();
      break;
    case "mojang":
    case "namemc":
      if(!args[0]) {textSend("Minecraft User","You must specify a minecraft username.",message,10); break;}
      fetch("https://api.mojang.com/users/profiles/minecraft/" + args[0]).then(y => y.text()).then(body => {
        if(!body) {textSend("Minecraft User","User not found.",message,15); return;}
        fetch("https://api.mojang.com/user/profiles/" + JSON.parse(body).id + "/names").then(y => y.text()).then(body => {
          var text = "";
          JSON.parse(body).forEach(e => text = e.changedToAt ? text + "**" + e.name + "** `" + new Date(parseInt(e.changedToAt)).toLocaleString() + "`\n" : text + "**" + e.name + "** `Original`\n\n");
          textSend("Minecraft User",text,message);
        });
      });
      break;
    case "sugg":
    case "suggest":
    case "suggestion":
      //if(message.guild.id != config.mhaGuild) {textSend("Suggestions","Command is meant to be used in the MHAA server.",message,10); break;}
      if(!args[0]) {textSend("Suggestions","You must specify your suggestion.",message,10); break;}
      var suggID;
      embed = {embed:{author:{name:"Suggested by: " + (message.member.nickname ? message.member.nickname : message.author.username),icon_url:message.author.displayAvatarURL()},description:args.join(" "),fields:[{name:"👎",value:"Downvotes: 0",inline:true},{name:"👍",value:"Upvotes: 0",inline:true}],color:Math.floor(Math.random()*16777215),timestamp: new Date()}};
      message.guild.channels.resolve(config.suggestions).send("",embed).then(m => {
        m.react("👎");
        setTimeout(() => {m.react("👍")},100);
        suggID = m.id;
        message.guild.channels.resolve(config.suggReview).send("",embed).then(mess => {
          mess.react("✅");
          setTimeout(() => {mess.react("❌")},100);
          var sugg = suggestions;
          sugg[suggID] = mess.id;
          fs.writeFileSync("./files/sugg.json", JSON.stringify(sugg));
        });
      });
      textSend("Suggestions","Suggestion send in <#" + config.suggestions + ">",message,3);
      break;
    case "run":
      if(message.member.id != author.id) {textSend("","Missing permissions.",message,15,16711680); return;}
      let code = msg.substring(msg.indexOf(" "));
      eval(code);
      break;
    case "edit":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(!args[0]) {textSend("Edit message","You must specify a message id from this channel.",message,10); break;}
      message.channel.messages.fetch(args.shift()).then(mess => {
        if(!mess) {textSend("Edit message","Message not found in this channel.",message,10); return;}
        if(mess.author.id != client.user.id) {textSend("Edit message","I must be the author of the message.",message,10); return;}
        if(!args[0]) {textSend("Edit message","You must specify new message content.",message,10); return;}
        embed.embed.title = "Message edited";
        embed.embed.fields = [{name:"Old content",value:mess.content},{name:"New content",value:args.join("")}];
        message.channel.send("",embed);
        console.log(args.join(" ").replace(/`/g,""))
        console.log(isJSON(args.join(" ").replace(/`/g,"")))
        if(isJSON(args.join(" ").replace(/`/g,""))) mess.edit("",JSON.parse(args.join(" ").replace(/`/g,"")));
        else mess.edit(args.join(" "));
      }).catch(e => textSend("Edit message","You must specify a message id from this channel.",message,10));
      break;
    case "bans":
    case "banlist":
      message.guild.fetchBans(true).then(bans => {
        var text = "";
        bans.forEach(b => text = b.reason ? text + "**" + b.user.username + "** `" + b.user.id + "` - " + b.reason + "\n" : text + "**" + b.user.username + "** `" + b.user.id + "` - No reason given.\n");
        textPrompt("Ban List",text,"\n",message,90000);
      });
      break;
    case "channelinfo":
    case "channel":
      if(!args[0]) {textSend("Channel Info","You must specify a channel. (Channel ID or name)",message,15); break;}
      channel = findChannel(args.join(" "));
      textSend("Channel Info for input: " + args.join(" "),"**Type:** " + channel.type + "\n**Created At:** " + channel.createdAt.toLocaleString() + "\n**From Guild (ID):** `" + channel.guild.id + "`\n**Channel ID:** `<#" + channel.id + ">`\n**Name:** " + channel.name + "\n**Parent (Category ID):** `" + channel.parentID + "`\n**Position:** " + channel.rawPosition +
       ((channel.type == "text" ? "\n**NSFW:** " + channel.nsfw + "\n**Topic:** `" + channel.topic : "")) +
       ((channel.type == "voice") ? "\n**Full:** " + channel.full  + "\n**User Limit:** " + channel.userLimit : "") +
       ((channel.type == "category" ? "\n**Children:** " + channel.children.array().join(", ") : ""))
      ,message);
      break;
    case "poll":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      embed.embed.title = "Poll Creator";
      embed.embed.description = "No text set.";
      embed.embed.fields = [{name:"Help",value:"React with:\n💬 - to set text.\n➕ - to add react option.\n🚫 - To reset reactions.\n✅ - To send poll.\n💟 - To toggle ping.\n❌ - To cancel poll."},{name:"Ping",value:true,inline:true},{name:"Reactions",value:"None set.",inline:true}];
      message.channel.send(embed).then(m => {
        let ping = true;
        m.react("💬");
        m.react("➕");
        m.react("🚫");
        m.react("💟");
        m.react("✅");
        m.react("❌");
        let collector = m.createReactionCollector((r,u) => !u.bot,{time:90000});
        collector.on("collect", r => {
          let user = r.users.last();
          if(user.id != message.author.id) {
            embed = embedPreset();
            embed.embed.title = "Poll Creator";
            embed.embed.description = r.users.last() + ", you are not the creator of this poll!";
            m.channel.send(embed).then(mes => mes.delete({timeout:3000}));
            return;
          }
          switch(r.emoji.toString()) {
            case "💬":
              r.users.remove(r.users.last());
              embed = embedPreset();
              embed.embed.title = "Poll Creator - Message Pending";
              embed.embed.description = "Send message that should be set as poll text.";
              m.channel.send(embed).then(mes => {
                let coll2 = m.channel.createMessageCollector(m2 => (!m2.author.bot && message.author.id == m2.author.id),{time:20000});
                coll2.on("end", () => mes.delete());
                coll2.on("collect", m2 => {
                  embed = toEmbedObj(m);
                  embed.embed.description = m2.content;
                  m.edit(embed);
                  m2.delete();
                  coll2.stop();
                });
              });
              break;
            case "➕":
              r.users.remove(r.users.last());
              embed = embedPreset();
              embed.embed.title = "Poll Creator - Emojis Pending";
              embed.embed.description = "Send messages that contain emojis to add them to the Poll Creator.";
              m.channel.send(embed).then(mes => {
                let coll2 = m.channel.createMessageCollector(m2 => (!m2.author.bot && message.author.id == m2.author.id),{time:20000});
                coll2.on("end", () => mes.delete());
                coll2.on("collect", m2 => {
                  embed = toEmbedObj(m);
                  if(!getEmoji(m2.content)) {
                    embed = embedPreset();
                    embed.embed.title = "Poll Creator";
                    embed.embed.description = "Message must contain emojis!";
                    m.channel.send(embed).then(m3 => m3.delete({timeout:3000}));
                    m2.delete();
                    return;
                  }
                  embed.embed.fields[2].value = getEmoji(m2.content).concat(getEmoji(embed.embed.fields[2].value)).filter(e=>e).join(", ");
                  m.edit(embed);
                  m2.delete();
                  coll2.stop();
                });
              });
              break;
            case "🚫":
              r.users.remove(r.users.last());
              embed = {};
              embed = toEmbedObj(m);
              embed.embed.fields[2].value = "None set.";
              m.edit(embed);
              break;
            case "💟":
              r.users.remove(r.users.last());
              embed = {};
              embed = toEmbedObj(m);
              ping = ping ? false : true;
              embed.embed.fields[1].value = ping;
              m.edit(embed);
              break;
            case "✅":
              r.users.remove(r.users.last());
              embed = embedPreset();
              if(m.embeds[0].description == "No text set.") {
                embed.embed.title = "Poll Creator";
                embed.embed.description = "You cannot send the poll if no poll text is set!";
                m.channel.send(embed).then(mes => mes.delete({timeout:3000}));
                return;
              }
              if(!getEmoji(m.embeds[0].fields[1].value) || (getEmoji(m.embeds[0].fields[1].value) && getEmoji(m.embeds[0].fields[1].value).length < 2)) {
                embed.embed.title = "Poll Creator";
                embed.embed.description = "You cannot send the poll if at least two poll reactions aren't specified!";
                m.channel.send(embed).then(mes => mes.delete({timeout:3000}));
                return;
              }
              embed = embedPreset();
              embed.embed.title = "Poll";
              embed.embed.description = m.embeds[0].description;
              embed.embed.color = Math.floor(Math.random()*16777215);
              embed.embed.author = {name:message.member.username ? message.member.username : message.author.username,icon_url:message.author.displayAvatarURL()};
              m.guild.channels.resolve(config.polls).send(ping ? "<@&" + config.pollRole + ">" : "",embed).then(mes => {for(let emoji of getEmoji(m.embeds[0].fields[2].value)) mes.react(emoji)});
              collector.stop("force");
              break;
            case "❌":
              r.users.remove(r.users.last());
              collector.stop("force");
              break;
          }
        });
        collector.on("end", (collected,reason) => {
          textSend("Poll Creator",reason == "force" ? "Cancelled by creator." : "Ended by timeout.",m,5);
          message.delete();
          m.delete();
        });
      });
      break;
    case "link":
      if(!args[0]) {textSend("Link Your Account","You must specify your minecraft account code.\nRetrieve it by executing this command ingame: **/link**",message,15); return}
      user = linkAttempt[args[0]];
      if(!user) {textSend("Link Your Account","This code is not valid.\nRetrieve your real code by executing this command ingame: **/link**",message,15); return}
      let attemptLink = linkAttempt;
      delete attemptLink[args[0]];
      fs.writeFileSync("./files/linkAccountsAttempt.json",JSON.stringify(attemptLink));
      let linkedAcc = linked;
      let splits = user.split("|");
      linkedAcc[message.author.id] = {uuid:splits[0],username:splits[1]};
      fs.writeFileSync("./files/linkedAccounts.json",JSON.stringify(linkedAcc));
      textSend("Link Your Account","Your minecraft and discord accounts have been linked successfully.",message,10);
      break;
    case "construct":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      constructQuirks();
      textSend("","Saved locally and in MagicSpells folder.\nRun **?trellobuild** to use the file to build cards.",message,10);
      break;
    case "trellobuild":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      trelloBuild();
      textSend("","Building Trello list... Please move the list to the official Trello board after this is done then run `?rosterbuild`.",message,30);
      break;
    case "rosterbuild":
      if(!hasAdminPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      rosterBuild();
      textSend("","Quirk Roster card updated. You have updated `?quirks`.",message,10);
      break;
    case "solved":
    case "fixed":
      if(!hasPerm(message.guild,message.member)) {textSend("","Missing permissions.",message,15,16711680); return;}
      if(message.channel.parentID && message.channel.parentID != config.bugReportCategory) {textSend("","You can only use this command in the bug report category!",message,10); return;}
      textSend("","Marked solved by: " + message.author.toString(),message);
      var solved = message.guild.channels.find(c => c.type == "category" && c.name == "Solved Cases");
      if(solved) makeSolved(solved);
      else message.guild.channels.create("Solved Cases",{type:"category",reason:"Created since one wasn't found."}).then(chc => {
        chc.setPosition(client.channels.resolve(config.bugReportCategory).position+1);
        makeSolved(chc);
      });
      function makeSolved(chc) {
        message.channel.setParent(chc);
        message.channel.updateOverwrite(config.verified, {SEND_MESSAGES:false}, "Case solved.");
        if(!message.channel.name.includes("solved")) message.channel.setName("solved-" + message.channel.name);
      };
      message.delete();
      break;
  }
});



client.on("messageReactionAdd", (reaction, user) => {
  const config = jsonify("./files/config.yml");
  const suggestions = require("./files/sugg.json");
  const suggAnswered = require("./files/suggAnswered.json");
  const {message} = reaction;
  // Ignore bot
  if(user.bot) return;
  let emoji = reaction.emoji.toString();
  // Staff applications
  if(message.content.includes("**New Staff Application made by:**")) {
    if(message.channel.id == config.staffApp) {
      let member = message.guild.members.resolve(reaction.users.last());
      if(!member) return;
      if(!hasAdminPerm(message.guild,member)) {reaction.users.remove(reaction.users.last()); return;}
      if(!message.mentions.members.last()) {
        client.channels.resolve(config.staffApp).send("<@" + reaction.users.last().id + ">, User couldn't be found. They either left the guild or the ID they used was invalid. " + (emoji == "✅" ? "You have to add their roles manually." : "")).then(m => setTimeout(() => m.delete(),15000));
        return;
      }
      switch(emoji) {
        case "✅":
          const app = message.embeds[0].description;
          let roles = [];
          // Fetch roles
          roles = roles.concat(app.substring(app.indexOf("Rank:*")+8,app.indexOf("\n",app.indexOf("Rank:*"))).split(","));
          // Get ID by correcting role names assigned by GForms
          roles = roles.map(r => {
            if(r == "3D Modeler") return "420674385536352265";
            if(r == "Quester (BetonQuest)") return "419650403961929766";
            if(r.includes("Config")) return "419650710012166144";
            if(r == "Builder") return "452133754031570944";
            if(r == "Lore") return "463744985376882688";
            if(r == "Trainee (Moderation)") return "419649947957198848";
          });
          // Remove duplicates
          roles = [...new Set(roles)];
          roles.push("419964554139926559");
          message.mentions.members.array()[0].roles.add(roles);
          client.channels.resolve(config.staffApp).send(message.mentions.members.array() + ", your staff application was accepted and the following roles were given to you: " + roles.map(r => "<@&" + r + ">").filter(e => e != "<@&undefined>").join(", "));
          embed = toEmbedObj(message);
          embed.embed.title = "Staff Application - Accepted";
          embed.embed.color = 65353;
          message.edit(message.content,embed);
          break;
        case "❌":
          client.channels.resolve(config.staffApp).send(message.mentions.members.array() + ", your staff application was denied.");
          embed = toEmbedObj(message);
          embed.embed.title = "Staff Application - Denied";
          embed.embed.color = 16711680;
          message.edit(message.content,embed);
          break;
      }
      return;
    }
    if(message.channel.id == config.staffAppReview) {
      message.channel.send("<@" + reaction.users.last().id + ">, please react in the <#" + config.staffApp + "> channel instead.");
      reaction.users.remove(reaction.users.last());
      return;
    }
  }
  // To Do List
  if(message.channel.id.includes(config.toDoList)) {
    if(!["✅","❌"].includes(emoji)) return;
    var embed = message.embeds[0];
    embed = {embed:{author:{name:embed.author.name,icon_url:embed.author.iconURL},description:embed.description,color:embed.color,timestamp:embed.timestamp}};
    embed.embed.color = (emoji == "✅") ? 65353 : 16711680;
    embed.embed.title = (emoji == "✅") ? "To Do List Item - Completed" : "To Do List Item - Rejected";
    client.channels.resolve(config.botLogs).send(embed);
    message.delete();
    return;
  }
  // Role on rule accept and welcome message embed
  if(emoji == "✅" && message.id.includes(config.ruleMsg)) {
    var member = message.guild.members.resolve(user);
    if(member.roles.has(config.unVerified)) member.roles.remove(config.unVerified);
    if(member.roles.has(config.verified)) return;
    member.roles.add(config.verified);
    member.roles.add(config.eventsRole);
    member.roles.add(config.pollRole);
    var embed = embedPreset();
    embed.embed.title = "User " + user.username + " has accepted the rules!";
    embed.embed.thumbnail.url = user.displayAvatarURL();
    embed.embed.color = Math.floor(Math.random()*16777215);
    const members = member.guild.roles.resolve(config.verified).members.map(m => m.user.tag);
    embed.embed.description = "**" + user.toString() + "** has accepted the rules and became a member of ***" + member.guild.name + "***! Count of people who accepted rules: **" + members.length + "/" + member.guild.memberCount + "**.";
    member.guild.channels.resolve(config.newUsers).send("",embed);
    embed = embedPreset();
    embed.embed.title = "Welcome " + member.user.username;
    embed.embed.description = fs.readFileSync("./files/welcome.txt").toString();
    member.send("",embed); 
    return;
  }
  // MHAA Role select channel (add react)
  if(message.channel.id == config.roleSelect) {
    switch(message.id) {
      // Toggle nsfw
      case config.nsfwMsg:
        if(emoji == "👍") message.guild.members.resolve(user).roles.add(config.nsfwRole);
        break;
      // Toggle poll
      case config.pollMsg:
        if(emoji == "✅") message.guild.members.resolve(user).roles.add(config.pollRole);
        break;
      // Toggle events
      case config.eventsMsg:
        if(emoji == "✅") message.guild.members.resolve(user).roles.add(config.eventsRole);
        break;
      // Toggle changelog
      case config.changelogMsg:
        if(emoji == "✅") message.guild.members.resolve(user).roles.add(config.changelogRole);
        break;
    }
    return;
  }
  if(message.channel.id == config.suggestions) {
    // Suggestion upvoted
    if(Object.keys(suggestions).includes(message.id)) {
      var embed;
      embed = message.embeds[0];
      embed = {embed:{author:{name:embed.author.name,icon_url:embed.author.iconURL},description:embed.description,color:embed.color,timestamp:embed.timestamp,fields:[{name:embed.fields[0].name,value:embed.fields[0].value,inline:embed.fields[0].inline},{name:embed.fields[1].name,value:embed.fields[1].value,inline:embed.fields[1].inline}]}};
      if(emoji == "👍") embed.embed.fields[1].value = "Upvotes: " + (reaction.count-1);
      if(emoji == "👎") embed.embed.fields[0].value = "Downvotes: " + (reaction.count-1);
      message.edit(embed);
      message.guild.channels.resolve(config.suggReview).messages.fetch(suggestions[message.id]).then(m => m.edit(embed));
    }
    // Denied suggestion delete
    var suggA = JSON.parse(fs.readFileSync("./files/suggAnswered.json"));
    if(suggA.includes(message.id)) {
      if(emoji == "❌") {
        fs.writeFileSync("./files/suggAnswered.json", JSON.stringify(suggA.filter(e => e != message.id)));
        message.delete();
      }
    }
    return;
  }
  if(message.channel.id == config.suggReview) {
    var sugg = require("./files/sugg.json");
    if(Object.values(sugg).includes(message.id)) {
      if(!(emoji == "❌" || emoji == "✅")) return;
      var channel = message.guild.channels.resolve(config.suggestions);
      channel.messages.fetch(Object.keys(sugg).find(s => sugg[s] == message.id)).then(m => {
        var embed = m.embeds[0];
        delete sugg[m.id];
        fs.writeFileSync("./files/sugg.json", JSON.stringify(sugg));
        m.delete();
        if(emoji == "❌") {
          embed = {embed:{author:{name:embed.author.name,icon_url:embed.author.iconURL},description:embed.description,color:16711680,timestamp:embed.timestamp,fields:[{name:embed.fields[0].name,value:embed.fields[0].value,inline:embed.fields[0].inline},{name:embed.fields[1].name,value:embed.fields[1].value,inline:embed.fields[1].inline},{name:"Suggestion Denied",value:"React with ❌ to remove."}]}};
          message.edit({embed:{description:"Suggestion denied.",color:16711680}});
        }
        if(emoji == "✅") {
          embed = {embed:{author:{name:embed.author.name,icon_url:embed.author.iconURL},description:embed.description,color:1703680,timestamp:embed.timestamp,fields:[{name:embed.fields[0].name,value:embed.fields[0].value,inline:embed.fields[0].inline},{name:embed.fields[1].name,value:embed.fields[1].value,inline:embed.fields[1].inline},{name:"Suggestion Accepted",value:"React with ❌ to remove."}]}};
          message.edit({embed:{description:"Suggestion accepted.",color:1703680}});
        }
        channel.send("",embed).then(mess => {
          mess.react("❌");
          var suggA = suggAnswered.concat(mess.id);
          fs.writeFileSync("./files/suggAnswered.json", JSON.stringify(suggA));
        });
        embed.embed.fields.splice(2,1);
        embed.embed.title = (emoji == "✅") ? "Suggestion Accepted" : "Suggestion Denied";
        client.channels.resolve(config.suggArchive).send("",embed);
        message.reactions.removeAll();
        message.delete({timeout:5000});
      });
    }
    return;
  }
  // Bug Reports
  if(reaction.message.id == config.bugReportMsg) {
    if(emoji == "☑") {
      reaction.message.guild.channels.create("case-" + hash8bit(reaction.users.last().id),{topic:message.author.id,reason:"Report or support ticket made by: " + reaction.users.last().id,topic:"Report or support ticket made by: " + reaction.users.last().username}).then(c => {
        c.setParent(config.bugReportsCategory);
        c.setPosition(1);
        c.send(reaction.users.last().toString() + " please use this channel for your bug report or support ticket.");
      });
    }
    reaction.users.remove(reaction.users.last());
  }
});



client.on("messageReactionRemove", (reaction, user) => {
  const config = jsonify("./files/config.yml");
  const suggestions = require("./files/sugg.json");
  if(!reaction) return;
  let emoji = reaction.emoji.toString();
  // MHAA Role select channel (remove react)
  if(reaction.message.channel.id == config.roleSelect) {
    switch(reaction.message.id) {
      // Toggle nsfw
      case config.nsfwMsg:
        if(emoji == "👍") reaction.message.guild.members.resolve(user).roles.remove(config.nsfwRole);
        break;
      // Toggle poll
      case config.pollMsg:
        if(emoji == "✅") reaction.message.guild.members.resolve(user).roles.remove(config.pollRole);
        break;
      // Toggle events
      case config.eventsMsg:
        if(emoji == "✅") reaction.message.guild.members.resolve(user).roles.remove(config.eventsRole);
        break;
      // Toggle changelog
      case config.changelogMsg:
        if(emoji == "✅") reaction.message.guild.members.resolve(user).roles.remove(config.changelogRole);
        break;
    }
    return;
  }
  // Suggestion downvoted
  if(reaction.message.channel.id == config.suggestions) {
    if(Object.keys(suggestions).includes(reaction.message.id)) {
      var embed;
      embed = reaction.message.embeds[0];
      embed = {embed:{author:{name:embed.author.name,icon_url:embed.author.iconURL},description:embed.description,color:embed.color,timestamp:embed.timestamp,fields:[{name:embed.fields[0].name,value:embed.fields[0].value,inline:embed.fields[0].inline},{name:embed.fields[1].name,value:embed.fields[1].value,inline:embed.fields[1].inline}]}};
      if(emoji == "👍") embed.embed.fields[1].value = "Upvotes: " + (reaction.count-1);
      if(emoji == "👎") embed.embed.fields[0].value = "Downvotes: " + (reaction.count-1);
      reaction.message.edit(embed);
      reaction.message.guild.channels.resolve(config.suggReview).messages.fetch(suggestions[reaction.message.id]).then(m => m.edit(embed));
    }
    return;
  }
});



// Emit message event if last message started with a prefix and still does
client.on("messageUpdate", (oldMessage, newMessage) => {
  const config = jsonify("./files/config.yml");
  if(oldMessage.content.startsWith(config["cmdPrefix"][newMessage.guild.id])) {
    if(newMessage.content.startsWith(config["cmdPrefix"][newMessage.guild.id])) {
      client.emit("message", newMessage);
    }
  }
});



// Announcer on join and leave
client.on("guildMemberAdd", member => {
  const config = jsonify("./files/config.yml");
  var embed = embedPreset();
  if(member.guild.id != config.mhaGuild) return;
  embed.embed.color = 65280;
  embed.embed.title = "User joined";
  embed.embed.description = "User " + member.user.username + " has joined the Discord server! Member count: **" + member.guild.memberCount + "**";
  embed.embed.url = "https://discord.gg/vm8wepS";
  member.guild.channels.resolve(config.newUsers).send("",embed);
  member.roles.add(config.unVerified);
});
client.on("guildMemberRemove", member => {
  const config = jsonify("./files/config.yml");
  var embed = embedPreset();
  if(member.guild.id != config.mhaGuild) return;
  embed.embed.color = 16711680;
  embed.embed.title = "User left";
  embed.embed.description = "User " + member.user.username + " has left the Discord server! Member count: **" + member.guild.memberCount + "**";
  embed.embed.url = "https://discord.gg/vm8wepS";
  member.guild.channels.resolve(config.newUsers).send("",embed);
});



// Delete channel duplicate in main server
client.on("channelCreate", channel => {
  if(!mainGuild.channels.has(channel.id)) return;
  // Fetch all channels with this channel's name
  var dms = mainGuild.channels.filter(c => c.name == channel.name).array();
  if(dms.length>1) {
    dms = dms[dms.length-1];
    logChannel.send("Deleted duplicate channel `" + dms.id + "` that was created at `" + dms.createdAt + "`");
    dms.delete("Duplicate.");
  }
});



// Delete "Solved Cases" category when empty.
client.on("channelDelete", channel => {
  var solved = channel.guild.channels.find(c => c.type == "category" && c.name == "Solved Cases");
  if(!solved) return;
  if(channel.parentID != solved.id) return;
  if(solved.children && solved.children.array().length > 0) return;
  solved.delete("Deleted since it's empty.");
});



// Log username changes for all users
client.on("userUpdate", (oldUser, newUser) => {
  if(oldUser.username == newUser.username) return;
  let users = jsonify("./files/usernameDB.yml");
  if(!users) users = {};
  if(!users[newUser.id]) users[newUser.id] = [{time:oldUser.createdAt.getTime(),username:oldUser.username}];
  users[newUser.id] = users[newUser.id].concat({time:new Date().getTime(),username:newUser.username});
  fs.writeFileSync("./files/usernameDB.yml", ymlify(users));
});



client.login(process.env.TOKEN).catch(console.log(console.error));



// Fire uncached events [Essential]
client.on("raw", event => {
  switch(event.t) {
    // Caching all reacted messages
    case "MESSAGE_REACTION_ADD":
    case "MESSAGE_REACTION_REMOVE":
      const channel = client.channels.resolve(event.d.channel_id);
      if(channel.messages.has(event.d.message_id)) return;
      channel.messages.fetch(event.d.message_id).then(message => {
        const reaction = message.reactions.resolve(event.d.emoji.id ? event.d.emoji.name + ":" + event.d.emoji.id : event.d.emoji.name);
        if(reaction) reaction.users.set(event.d.user_id, client.users.resolve(event.d.user_id));
        if(event.t == "MESSAGE_REACTION_ADD") client.emit("messageReactionAdd", reaction, client.users.resolve(event.d.user_id));
        if(event.t == "MESSAGE_REACTION_REMOVE") client.emit("messageReactionRemove", reaction, client.users.resolve(event.d.user_id));
      }); 
      break;
    case "MESSAGE_DELETE":
      //console.log(event)
      break;
  }
});
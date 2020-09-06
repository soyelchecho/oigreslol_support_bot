const {Client, MessageEmbed} = require('discord.js');
const fs = require("fs");


//JSON CONFIGS
let sessiones = JSON.parse(fs.readFileSync("./sessiones.json", "utf8"));
let prefixs = JSON.parse(fs.readFileSync("./prefix.json", "utf8"));


///CONSTANTES

const prefix = '|' ;
const salas = "salas";
const servers = "servers";
const vivo = "vivo";
const muerto = "muerto";

///////

const bot = new Client();


bot.on('ready', () => {
    bot.user.setActivity("Listo para lo que sea pa");
});

bot.on('message', (message) =>{
    if(checkCommand(message.content)){
        switch (extractCommand(message.content)['groups']['command']) {
            case undefined:
                message.reply("PARA COMENZAR UNA PARTIDA PORFAVOR DAME UN COMANDO");
                break;
            case 'crear' || 'c':
                if(message.member.voice.channel){
                    var guild_id = message.guild.id;
                    if (!(guild_id in sessiones[servers])){
                        sessiones[servers][guild_id] = {'salas':{}}
                    }
                    var channel_id = message.member.voice.channelID
                    if (channel_id in sessiones[servers][guild_id][salas]){
                        message.reply("YA EXISTE UNA SESSION EN ESTA SALA PERRO");
                    }else{
                        sessiones[servers][guild_id][salas][channel_id] = {}
                        bot.channels.cache.get(channel_id).members.forEach(member => {
                            if(!(member.id in sessiones[servers][guild_id][salas][channel_id])){
                                sessiones[servers][guild_id][salas][channel_id][member.id] = vivo;
                            }
                        });
                    }
                    fs.writeFile("./sessiones.json", JSON.stringify(sessiones), (err) => {
                        if (err) console.error(err)
                    });
                    message.channel.send("PARTIDA CREADA");
                    /* MUTEAR PERSONAS
                    for (let member of message.member.voice.channel.members) {
                        member[1].voice.setMute(true)
                    }*/
                }else{
                    message.reply("¡Para empezar una partida debes estar adentro de una sala de voz!")
                }
                break;
            case 'mute' || 'm':
                if(message.member.voice.channel){
                    var guild_id = message.guild.id;
                    if (!(guild_id in sessiones[servers])){
                        message.reply("NO SE HA CREADO UNA SESSION EN EL SERVER")
                        break;
                    }
                    var channel_id = message.member.voice.channelID
                    if (!(channel_id in sessiones[servers][guild_id][salas])){
                        message.reply("NO SE HA CREADO UNA SESSION EN LA SALA");
                        break;
                    }
                    invocador_id = message.member.id;
                    if(invocador_id in sessiones[servers][guild_id][salas][channel_id]){
                        Object.keys(sessiones[servers][guild_id][salas][channel_id]).forEach(function(key) {
                            var miembro = message.guild.members.cache.get(key);
                            if(miembro.voice.channel){
                                if(miembro.voice.channelID ==  channel_id){
                                    miembro.voice.setMute(true);
                                }
                            }
                        });
                        message.channel.send("TODOS HAN SIDO MUTEADOS")
                    }
                }else{
                    message.reply("¡Para mutear a todos debe haber una partida en curso")
                }
                break;
            case 'desmute' || 'ds':
                if(message.member.voice.channel){
                    var guild_id = message.guild.id;
                    if (!(guild_id in sessiones[servers])){
                        message.reply("NO SE HA CREADO UNA SESSION EN EL SERVER")
                        break;
                    }
                    var channel_id = message.member.voice.channelID
                    if (!(channel_id in sessiones[servers][guild_id][salas])){
                        message.reply("NO SE HA CREADO UNA SESSION EN LA SALA");
                        break;
                    }
                    invocador_id = message.member.id;
                    if(invocador_id in sessiones[servers][guild_id][salas][channel_id]){
                        Object.keys(sessiones[servers][guild_id][salas][channel_id]).forEach(function(key) {
                            var miembro = message.guild.members.cache.get(key);
                            if(sessiones[servers][guild_id][salas][channel_id][miembro.id] == vivo){
                                if(miembro.voice.channel){
                                    if(miembro.voice.channelID ==  channel_id){
                                        miembro.voice.setMute(false);
                                    }
                                }
                            }
                        });
                        message.channel.send("SE HAN DESMUTEADO A TODOS")
                    }
                }else{
                    message.reply("¡Para mutear a todos debe haber una partida en curso")
                }
                break;
            case 'list' || 'l':
                if(message.member.voice.channel){
                    var guild_id = message.guild.id;
                    if (!(guild_id in sessiones[servers])){
                        message.reply("NO SE HA CREADO UNA SESSION EN EL SERVER")
                        break;
                    }
                    var channel_id = message.member.voice.channelID
                    if (!(channel_id in sessiones[servers][guild_id][salas])){
                        message.reply("NO SE HA CREADO UNA SESSION EN LA SALA");
                        break;
                    }
                    usuarios = []
                    Object.keys(sessiones[servers][guild_id][salas][channel_id]).forEach(function(key) {
                        var miembro = message.guild.members.cache.get(key);
                        usuarios.push({
                            name: "Jugadores",
                            value: miembro.nickname + " -Esta: " + sessiones[servers][guild_id][salas][channel_id][key]
                          })
                    });
                    message.channel.send({embed: {
                        color: 3447003,
                        title: "LISTA DE JUGADORES",
                        fields: usuarios
                      }});
                }
                break;
            case 'kill' || 'k':
                if(message.member.voice.channel){
                    var guild_id = message.guild.id;
                    if (!(guild_id in sessiones[servers])){
                        message.reply("NO SE HA CREADO UNA SESSION EN EL SERVER")
                        break;
                    }
                    var channel_id = message.member.voice.channelID
                    if (!(channel_id in sessiones[servers][guild_id][salas])){
                        message.reply("NO SE HA CREADO UNA SESSION EN LA SALA");
                        break;
                    }
                    usuarios = []
                    var menciones = extractCommand(message.content)['groups']['menciones']
                    var lista = menciones.replace(/ /g,'').replace(/<@!/g,'').split('>')
                    lista.forEach(element => {
                        if(element != ''){
                            var miembro = message.guild.members.cache.get(element);
                            if(miembro.id in sessiones[servers][guild_id][salas][channel_id]){
                                sessiones[servers][guild_id][salas][channel_id][miembro.id] = muerto;
                            }
                        }
                    });
                    fs.writeFile("./sessiones.json", JSON.stringify(sessiones), (err) => {
                        if (err) console.error(err)
                    });
                }else{
                    message.reply("PARA MATAR A ALGUIEN DEBES ESTAR EN LA SALA DE VOZ")
                }
                break;
            case 'add' || 'a':
                if(message.member.voice.channel){
                    var guild_id = message.guild.id;
                    if (!(guild_id in sessiones[servers])){
                        message.reply("NO SE HA CREADO UNA SESSION EN EL SERVER")
                        break;
                    }
                    var channel_id = message.member.voice.channelID
                    if (!(channel_id in sessiones[servers][guild_id][salas])){
                        message.reply("NO SE HA CREADO UNA SESSION EN LA SALA");
                        break;
                    }
                    usuarios = []
                    var menciones = extractCommand(message.content)['groups']['menciones']
                    var lista = menciones.replace(/ /g,'').replace(/<@!/g,'').split('>')
                    lista.forEach(element => {
                        if(element != ''){
                            var miembro = message.guild.members.cache.get(element);
                            if(!(miembro.id in sessiones[servers][guild_id][salas][channel_id])){
                                sessiones[servers][guild_id][salas][channel_id][miembro.id] = vivo;
                            }
                        }
                    });
                    fs.writeFile("./sessiones.json", JSON.stringify(sessiones), (err) => {
                        if (err) console.error(err)
                    });
                }else{
                    message.reply("PARA AGREGAR A ALGUIEN DEBES ESTAR EN LA SALA DE VOZ")
                }
                break;
            case 'fin' || 'f':
                if(message.member.voice.channel){
                    var guild_id = message.guild.id;
                    if (!(guild_id in sessiones[servers])){
                        message.reply("NO SE HA CREADO UNA SESSION EN EL SERVER")
                        break;
                    }
                    var channel_id = message.member.voice.channelID
                    if (!(channel_id in sessiones[servers][guild_id][salas])){
                        message.reply("NO SE HA CREADO UNA SESSION EN LA SALA");
                        break;
                    }
                    usuarios = []
                    delete sessiones[servers][guild_id][salas][channel_id]
                    fs.writeFile("./sessiones.json", JSON.stringify(sessiones), (err) => {
                        if (err) console.error(err)
                    });
                    message.channel.send("SE TERMINO LA PARTIDA")
                }else{
                    message.reply("PARA TERMINAR LA PARTIDA DEBES")
                }
                break;
            default:
                break;
        }
    }
});

function checkCommand(message){
    var parser = /^!session\s*([a-zA-Z]+)?\s*((<@![0-9]+>\s*)+)*$/i
    return  parser.test(message);
}

function extractCommand(message){
    var parser = /^!session\s*(?<command>[a-zA-Z]+)?\s*(?<menciones>(<@![0-9]+>\s*)+)*$/i
    return parser.exec(message)
}



bot.login('NzUwOTQwMjc3ODQxMzMwMjQ4.X1B1og.YdoWf_g3hZ9w61Ug4x05rh8UI_Q');


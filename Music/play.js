////////////////////////////
//////CONFIG LOAD///////////
////////////////////////////
const { play } = require("../include/play");
const { Client, Collection, MessageEmbed } = require("discord.js");
const { attentionembed } = require("../util/attentionembed");
const { PREFIX } = require(`../config.json`);
const ytsr = require("youtube-sr")

////////////////////////////
//////COMMAND BEGIN/////////
////////////////////////////
module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Lit la chanson de YouTube / Stream",
  cooldown: 1.5,
  edesc: `Tapez cette commande pour jouer de la musique.\nUsage: ${PREFIX}play <TITLE | URL>`,
  
async execute(message, args, client) {
    //If not in a guild return
    if (!message.guild) return;
    //define channel
    const { channel } = message.member.voice;
    //get serverqueue
    const serverQueue = message.client.queue.get(message.guild.id);
    //If not in a channel return error
    if (!channel) return attentionembed(message, "Veuillez d'abord rejoindre une chaîne vocale");
    //If not in the same channel return error
    if (serverQueue && channel !== message.guild.me.voice.channel)
      return attentionembed(message, `Vous devez être dans le même canal vocal que moi`);
    //If no args return
    if (!args.length)
      return attentionembed(message, `Usage: ${message.client.prefix}play <YouTube URL | Video Name | Soundcloud URL>`);
    //react with approve emoji
    message.react("✅").catch(console.error);
    //get permissions and send error if bot doesnt have enough
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return attentionembed(message, "J'ai besoin d'autorisations pour rejoindre votre chaîne!");
    if (!permissions.has("SPEAK"))
      return attentionembed(message, "J'ai besoin des autorisations pour parler dans votre chaîne");

    //define some url patterns
    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const urlValid = videoPattern.test(args[0]);

    //define Queue Construct
    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 69,
      filters: [],
      realseek: 0,
      playing: true
    };
    //get song infos to null
    let songInfo = null;
    let song = null;
    //try catch for errors
    try {
      //If something is playing
      if (serverQueue) {
        //if its an url
        if (urlValid) { //send searching link
          message.channel.send(new MessageEmbed().setColor("#c219d8")
            .setDescription(`**💢 Recherche 🔍 [\`LINK\`](${args.join(" ")})**`))
        //if not
        }
        else { //send searching TITLE
          message.channel.send(new MessageEmbed().setColor("#c219d8")
            .setDescription(`**💢 Recherche 🔍 \`${args.join(" ")}\`**`))
        }
      } else {
        //If nothing is playing join the channel
        queueConstruct.connection = await channel.join();
        //send join message
        message.channel.send(new MessageEmbed().setColor("#c219d8")
          .setDescription(`**👍 Joined \`${channel.name}\` 📄 bound \`#${message.channel.name}\`**`)
          .setFooter(`By: ${message.author.username}#${message.author.discriminator}`))
        //if its an url
        if (urlValid) { //send searching link
          message.channel.send(new MessageEmbed().setColor("#c219d8")
            .setDescription(`**💢 Recherche 🔍 [\`LINK\`](${args.join(" ")})**`))
          //if not 
        }
        else { //send searching TITLE
          message.channel.send(new MessageEmbed().setColor("#c219d8")
            .setDescription(`**💢 Recherche 🔍 \`${args.join(" ")}\`**`))
        }
        //Set selfdeaf and serverdeaf true
        queueConstruct.connection.voice.setSelfDeaf(true);
        queueConstruct.connection.voice.setDeaf(true);
      }
    }
    catch {
    }
    //if its a valdi youtube link
    if (urlValid) {
      try {
        songInfo = await ytsr.searchOne(search) ;
        song = {
          title: songInfo.title,
          url: songInfo.url,
          thumbnail: songInfo.thumbnail,
          duration: songInfo.durationFormatted,
       };
      } catch (error) {
        if (error.statusCode === 403) return attentionembed(message, "Max. utilisations de la clé API, veuillez actualiser!");
        console.error(error);
        return attentionembed(message, error.message);
      }
    } 
    //else try to find the song via ytsr 
    else {
      try {
       //get the result 
        songInfo = await ytsr.searchOne(search) ;
        song = {
          title: songInfo.title,
          url: songInfo.url,
          thumbnail: songInfo.thumbnail,
          duration: songInfo.durationFormatted,
       };
      } catch (error) {
        console.error(error);
        return attentionembed(message, error);        
      }                                                               
    }
    //get the thumbnail
    let thumb = "https://cdn.discordapp.com/attachments/748095614017077318/769672148524335114/unknown.png"
    if (song.thumbnail === undefined) thumb = "https://cdn.discordapp.com/attachments/748095614017077318/769672148524335114/unknown.png";
    else thumb = song.thumbnail.url;
    //if there is a server queue send that message!
    if (serverQueue) {
      //Calculate the estimated Time
      let estimatedtime = Number(0);
      for (let i = 0; i < serverQueue.songs.length; i++) {
        let minutes = serverQueue.songs[i].duration.split(":")[0];   
        let seconds = serverQueue.songs[i].duration.split(":")[1];    
        estimatedtime += (Number(minutes)*60+Number(seconds));   
      }
      if (estimatedtime > 60) {
        estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
        estimatedtime = estimatedtime + " Minutes"
      }
      else if (estimatedtime > 60) {
        estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
        estimatedtime = estimatedtime + " Heures"
      }
      else {
        estimatedtime = estimatedtime + " Seconds"
      }
      //Push the ServerQueue
      serverQueue.songs.push(song);
      //the new song embed
      const newsong = new MessageEmbed()
        .setTitle("✅ " + song.title)
        .setColor("#c219d8")
        .setThumbnail(thumb)
        .setURL(song.url)
        .setDescription(`\`\`\`A été ajouté à la file d'attente.\`\`\``)
        .addField("Temps estimé avant de jouer:", `\`${estimatedtime}\``, true)
        .addField("Position dans la file d'attente", `**\`${serverQueue.songs.length - 1}\`**`, true)
        .setFooter(`Demandé par: ${message.author.username}#${message.author.discriminator}`, message.member.user.displayAvatarURL({ dynamic: true }))
      //send the Embed into the Queue Channel
        return serverQueue.textChannel
        .send(newsong)
        .catch(console.error);
      
    }
    //push the song list by 1 to add it to the queu
    queueConstruct.songs.push(song);
    //set the queue
    message.client.queue.set(message.guild.id, queueConstruct);
    //playing with catching errors
    try {
    
      //try to play the song
      play(queueConstruct.songs[0], message, client);
    } catch (error) {
      //if an error comes log
      console.error(error);
      //delete the Queue
      message.client.queue.delete(message.guild.id);
      //leave the channel
      await channel.leave();
      //sent an error message
      return attentionembed(message, `Impossible de rejoindre la chaîne: ${error}`);
    }
  }
};

//////////////////////////////////////////
//////////////////////////////////////////
/////////////by Tomato#6966///////////////
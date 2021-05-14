////////////////////////////
//////CONFIG LOAD///////////
////////////////////////////
const createBar = require("string-progressbar");
const { Client, Collection, MessageEmbed } = require("discord.js");
const { attentionembed } = require("../util/attentionembed"); 
const { PREFIX } = require(`../config.json`);
////////////////////////////
//////COMMAND BEGIN/////////
////////////////////////////
module.exports = {
  name: "nowplaying",
  aliases: ['np',"now-playing","current","current-song"],
  description: "Afficher la chanson actuelle",
  cooldown: 5,
  edesc: `Tapez nowplaying dans le chat, pour voir quelle chanson est en cours de lecture! Ainsi que combien de temps il faudra jusqu'à ce qu'il soit terminé\nUsage: ${PREFIX}nowplaying`,
  
execute(message) {
    //if not in a guild return
    if(!message.guild) return;
    //react with approve emoji
    message.react("✅")
    //get Server Queue
    const queue = message.client.queue.get(message.guild.id);
    //if nothing playing error
    if (!queue) return attentionembed(message, "Il n'y a rien qui joue.").catch(console.error);
    //Define the current song 
    const song = queue.songs[0];
    //get current song duration in s
    let minutes = song.duration.split(":")[0];   
    let seconds = song.duration.split(":")[1];    
    let ms = (Number(minutes)*60+Number(seconds));   
    //get thumbnail
    let thumb;
    if (song.thumbnail === undefined) thumb = "https://cdn.discordapp.com/attachments/748095614017077318/769672148524335114/unknown.png";
    else thumb = song.thumbnail.url;
    //define current time
    const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
    //define left duration
    const left = ms - seek;
    //define embed
    let nowPlaying = new MessageEmbed()
      .setTitle("Lecture en cours")
      .setDescription(`[**${song.title}**](${song.url})`)
      .setThumbnail(song.thumbnail.url)
      .setColor("#c219d8")
      .setFooter("Temps restant: " + new Date(left * 1000).toISOString().substr(11, 8));
      //if its a stream
      if(ms >= 10000) {
        nowPlaying.addField("\u200b", "🔴 LIVE", false);
        //send approve msg
        return message.channel.send(nowPlaying);
      }
      //If its not a stream 
      if (ms > 0 && ms<10000) {
        nowPlaying.addField("\u200b", "**[" + createBar((ms == 0 ? seek : ms), seek, 25, "▬", "⚪️")[0] + "]**\n**" + new Date(seek * 1000).toISOString().substr(11, 8) + " / " + (ms == 0 ? " ◉ LIVE" : new Date(ms * 1000).toISOString().substr(11, 8))+ "**" , false );
        //send approve msg
        return message.channel.send(nowPlaying);
      }
  }
};

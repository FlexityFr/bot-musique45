////////////////////////////
//////CONFIG LOAD///////////
////////////////////////////
const { canModifyQueue } = require("../util/MilratoUtil");
const { Client, Collection, MessageEmbed } = require("discord.js");
const { attentionembed } = require("../util/attentionembed"); 
const { PREFIX } = require(`../config.json`);
////////////////////////////
//////COMMAND BEGIN/////////
////////////////////////////
module.exports = {
  name: "stop",
  description: "Stops the music",
  aliases: ["leave", "end"],
  cooldown: 5,
  edesc: `Tapez la commande, pour arrêter la lecture et quitter le canal.\nUsage: ${PREFIX}stop`,

async execute(message,args,client) {
  //if not in a guild retunr
  if (!message.guild) return;
  //react with approve emoji
  message.react("✅").catch(console.error);
  const { channel } = message.member.voice;
  //get the serverQueue
  const queue = message.client.queue.get(message.guild.id);
  //if not a valid channel
  if (!channel) return attentionembed(message, "Veuillez d'abord rejoindre une chaîne vocale");  
  //If not in the same channel return error
  if (queue && channel !== message.guild.me.voice.channel)
  return attentionembed(message, `Vous devez être dans le même canal vocal que moi`);
  //if no Queue return error
  if (!queue)
    return attentionembed(message, "Il n'y a rien que tu puisses arrêter!");
  //if not in the same channel return
  if (!canModifyQueue(message.member)) return;
  //Leave the channel
  await channel.leave();
  //send the approve message    
  message.channel.send(new MessageEmbed()
  .setColor("#c219d8")
  .setAuthor(`${message.author.username} arrêté la musique!`, "https://cdn.discordapp.com/emojis/769915194066862080.png"))
  .catch(console.error);
  }
};

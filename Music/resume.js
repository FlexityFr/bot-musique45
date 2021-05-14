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
  name: "resume",
  aliases: ["r"],
  description: "Reprendre la lecture de la musique en cours",
  cooldown: 5,
  edesc: `Tapez cette commande pour reprendre le morceau en pause!\nUsage: ${PREFIX}resume`,
  
execute(message) {
    //if not a guild return
    if(!message.guild) return;
    //react with approve emoji
    message.react("✅").catch(console.error);
    //get the Server Queue
    const queue = message.client.queue.get(message.guild.id);
    //if no queue return error
    if (!queue) return attentionembed(message,"Il n'y a rien qui joue!").catch(console.error);
    //if user not in the same channel as the bot retunr
    if (!canModifyQueue(message.member)) return;
    //if its paused
    if (!queue.playing) {
      //set it to true
      queue.playing = true;
      //resume the Bot
      queue.connection.dispatcher.resume();
      //Create approve embed
      const playembed = new MessageEmbed().setColor("#c219d8")
      .setAuthor(`${message.author.username} repris la musique!`, "https://cdn.discordapp.com/emojis/769912238236106793.png")
      //send the approve
      return queue.textChannel.send(playembed).catch(console.error);
    }
    //if its not paused return error
    return  attentionembed(message, "La file d'attente n'est pas interrompue!").catch(console.error);
  }
};

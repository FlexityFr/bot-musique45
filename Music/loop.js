////////////////////////////
//////CONFIG LOAD///////////
////////////////////////////
const { canModifyQueue } = require("../util/MilratoUtil");
const { MessageEmbed } = require("discord.js");
const { attentionembed } = require("../util/attentionembed"); 
const { PREFIX } = require(`../config.json`);
////////////////////////////
//////COMMAND BEGIN/////////
////////////////////////////
module.exports = {
  name: "loop",
  aliases: ['l'],
  description: "Basculer la boucle musicale",
  cooldown: 3,
  edesc: `Tapez simplement la commande dans le chat pour activer / désactiver la boucle, vous pouvez également réagir à la boucle emoji, pour recevoir le même objectif!\nUsage: ${PREFIX}loop`,
async execute(message) {
    //if not in a Guild return
    if(!message.guild) return;
    //Get the current Queue
    const queue = message.client.queue.get(message.guild.id);
    //If no Queue Error
    if (!queue) return attentionembed(message, "Il n'y a rien qui joue").catch(console.error);
    //If not in a VOICE 
    if (!await canModifyQueue(message.member)) return;
    //Reverse the Loop state
    queue.loop = !queue.loop;
    //Define the Loop embed
    const loopembed = new MessageEmbed()
    .setColor(queue.loop ? "#c219d8" : "#ff0e7a")
    .setAuthor(`Loop is now ${queue.loop ? " enabled" : " disabled"}`, "https://cdn.discordapp.com/emojis/769913064194834511.png")
    //react with approve emoji
    message.react("✅");
    //send message into the Queue chat
    return queue.textChannel
      .send(loopembed)
      .catch(console.error);
  }
};

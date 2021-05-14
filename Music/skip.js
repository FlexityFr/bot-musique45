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
  name: "skip",
  aliases: ["s"],
  description: "Ignorer la chanson en cours de lecture ",
  cooldown: 5,
  edesc: `Tapez la commande pour passer à la chanson en cours d'écoute.\nUsage: ${PREFIX}skip`,

execute(message) {
    //if not in a guild retunr
    if (!message.guild) return;
    //react with approve emoji
    message.react("✅").catch(console.error);
    //get the queue
    const queue = message.client.queue.get(message.guild.id);
    //if no Queue return error
    if (!queue)
      return attentionembed(message, "Il n'y a rien que tu puisses sauter!").catch(console.error);
    //if not in the same channel return
    if (!canModifyQueue(message.member)) return;
    //set playing to true 
    queue.playing = true;
    //end current song
    queue.connection.dispatcher.end();
    //send approve message
    queue.textChannel.send(
      new MessageEmbed().setColor("#c219d8").setAuthor(`${message.author.username} a sauté la chanson.`, "https://cdn.discordapp.com/emojis/769915194444480542.png")
    ).catch(console.error);
  }
};

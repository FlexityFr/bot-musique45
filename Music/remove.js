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
  name: "remove",
  description: "Supprimer la chanson de la file d'attente",
  aliases: ["delete"],
  cooldown: 1.5,
  edesc: `Tapez cette commande pour supprimer une chanson spécifique de la file d'attente.\nUsage: ${PREFIX}remove <Queue num.>`,

execute(message, args) {
  //if its not a guild return
    if(!message.guild) return;
    //get the queue
    const queue = message.client.queue.get(message.guild.id);
    //if there is no queue return error
    if (!queue) return attentionembed(message,"Il n'y a pas de file d'attente");
    //if he isnt in the same voice channel as the bot
    if (!canModifyQueue(message.member)) return;
    //if no args then return error
    if (!args.length) return attentionembed(message,`Try: ${message.client.prefix}remove <Numéro de file d'attente>`);
    //If not a number then return error
    if (isNaN(args[0])) return attentionembed(message,`Try: ${message.client.prefix}remove <Numéro de file d'attente>`);
    //get the song
    const song = queue.songs.splice(args[0], 1);
    //react with approve
    message.react("✅")
    //send approve
    queue.textChannel.send(new MessageEmbed()
    .setDescription(`❌ | ${message.author} supprimé **${song[0].title}** de la file d'attente`)
    .setColor("#c219d8")
    );
  }
};

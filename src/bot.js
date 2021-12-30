require('dotenv').config();
const wd = require("word-definition");
const insult = require("./data/insults.js");
const google = require('google-it');
google.resultsPerPage = 25;
const { Client, Intents, Formatters, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PREFIX = "$"; // Prefix for commands

async function handleDefine(message, args) {
    const word = args.join(" ");
    try {
        wd.getDef(word, "en", null, async function (definition) {
            let reply = `**${word}** (${definition.category}): ${definition.definition}`;
            if (!definition.definition) {
                reply = `No definition found`;
            }
            message.reply(reply);
        });
    } catch (e) {
        return message.reply(e);
    }
}

async function handleGoogle(message, args) {
    const query = args.join(" ");
    google({ 'query': query }).then(results => {
        const embeds = []
        if (results.length == 0) throw new Error("No results found");
        for (let i = 0; i < 5; i++) {
            const result = results[i];
            const embed = new MessageEmbed()
                .setTitle(result.title)
                .setURL(result.link)
                .setDescription(result.snippet)
                .setColor('#0099ff');

            embeds.push(embed);
        }

        message.reply({ embeds });
    }).catch(e => {
        message.reply("That was a terrible search term, try again please.")
    })
}


async function handleCommand(message) {
    const [command, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);;

    if (command === 'define') {
        await handleDefine(message, args);
    }
    else if (command === 'google') {
        handleGoogle(message, args);
    }
    else if (command === 'ivan') {
        // get an insult and replace all words that are "you" or "your" with ivan
        const insultSend = insult[Math.floor(Math.random() * insult.length)]
        const newInsult = insultSend.replace(/you|your/gi, "ivan");
        message.reply(newInsult);
    }

}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith(PREFIX)) {
        await handleCommand(message);
    }
    else if (message.author.id == "695749433907740722") {
        const insultSend = insult[Math.floor(Math.random() * insult.length)]
        message.reply(insultSend);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
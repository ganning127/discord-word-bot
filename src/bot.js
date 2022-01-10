require('dotenv').config();
const wd = require("word-definition");
const google = require('google-it');
const insults = require("./data/insults.js");
const figlet = require('figlet');
google.resultsPerPage = 25;
const { Client, Intents, Formatters, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PREFIX = "$"; // Prefix for commands
async function handleDefine(message, args) {
    if (args.length == 0) {
        message.reply("Please provide a word to define");
        return;
    }
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
    // the npm package automatically handles no arguments
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

async function handleArt(message, args) {
    if (args.length == 0) {
        message.reply("Please enter a word to draw!");
    }
    const wordArt = args.join(" ");
    figlet(wordArt, function (err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        message.reply("```" + data + "```");
    });
}

async function handleInsult(message, args) {
    let insult = insults[Math.floor(Math.random() * insults.length)]
    if (args.length == 0) {
        message.reply(insult);
    }
    else if (args.length == 1) {
        let arg = args[0];
        message.reply(insult.replace(/you're/gi, `${arg}'s`).replace("/your/gi", `${arg}'s`).replace(/you/gi, `${arg}'s`));
    }
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
    else if (command === 'art') {
        await handleArt(message, args);
    }
    else if (command === 'insult') {
        await handleInsult(message, args);
    }
    else if (command == 'help') {
        let embeds = [];
        let desc = `
        **$define <word>** - Get the definition of a word
        **$google <query>** - Search google
        **$art <word>** - Get art for a word
        **$insult <?name>** - Get an insult targeting you or a name (if name is not specified, it will target you)
        **$help** - Get this message
        `;
        const embed = new MessageEmbed()
            .setTitle("Word Bot Help")
            .setDescription(desc)
            .setColor('#0099ff');

        embeds.push(embed);
        message.reply({ embeds });
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith(PREFIX)) {
        await handleCommand(message);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
require("dotenv").config();
const axios = require("axios");
const { Telegraf } = require("telegraf");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(botToken);

// Start message
bot.start((ctx) => {
  const message = `Welcome to the Dictionary Bot! 📚
  
I can help you find word definitions, synonyms, antonyms, and example sentences.

To get started, simply use the /define command followed by the word you want to look up. For example:
  
/define hello

Feel free to explore and enhance your vocabulary with this bot!

Please note that the definitions provided are based on the English language.

Enjoy using the Dictionary Bot! 🌟`;

  ctx.reply(message);
});

// Message handler
async function fetchWordDetails(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  try {
    const response = await axios.get(url);
    const data = response.data[0];
    const definition =
      data.meanings[0]?.definitions[0]?.definition || "No definition found";
    const synonyms = data.meanings[0]?.definitions[0]?.synonyms || [];
    const antonyms = data.meanings[0]?.definitions[0]?.antonyms || [];
    const example =
      data.meanings[0]?.definitions[0]?.example || "No example found";

    return {
      definition,
      synonyms,
      antonyms,
      example,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch word details.");
  }
}

bot.command("define", async (ctx) => {
  const word = ctx.message.text.split(" ")[1];

  if (!word) {
    ctx.reply("Please provide a word to define.");
    return;
  }

  try {
    const wordDetails = await fetchWordDetails(word);

    let message = `Definition of ${word}:\n\n${wordDetails.definition}\n\n`;
    if (wordDetails.synonyms.length > 0) {
      message += `Synonyms: ${wordDetails.synonyms.join(", ")}\n`;
    }
    if (wordDetails.antonyms.length > 0) {
      message += `Antonyms: ${wordDetails.antonyms.join(", ")}\n`;
    }
    message += `Example: ${wordDetails.example}`;

    ctx.reply(message);
  } catch (error) {
    console.error(error);
    ctx.reply(
      "Sorry, an error occurred while fetching word details. Please try again later."
    );
  }
});

bot.launch();

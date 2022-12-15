const {format} = require('date-fns')
const express = require("express");
const venom = require("venom-bot");
const db = require("./database");

const chatRoute = require("./routers/chat");

const app = express();

app.use("/chats", chatRoute);

app.listen(3333, () => {
  console.log("servidor iniciado");
});

venom.create({
  "autoClose":0,
  "browserArgs":[
     "--no-sandbox"
  ],
  "headless": true,
  "devtools": false,
  "useChrome": false,
  "debug": false,
  "logQR": false,
  "disableSpins": true,
  "disableWelcome": true
}).then((client) => {
  try {
    start(client);
  } catch (er) {
    console.log(er);
  }
});

function start(client) {
  try {
    client.onMessage(async (message) => {
      try {
        if (message.body && !message.isGroupMsg) {
          const Chats = db.Mongoose.model("chats", db.ChatSchema, "chats");

          const chatFrom = await Chats.findOne({ phone: message.from, date: format(new Date(), 'dd-MM-yyyy') })
            .lean()
            .exec();
          if (!chatFrom) {
            const newChat = new Chats({
              phone: message.from,
              created_at: new Date(),
              type: "welcome",
              date: format(new Date(), 'dd-MM-yyyy')
            });

            try {
              await newChat.save();
            } catch (err) {
              console.log("erro ao salvar", err);
            }
            await client.sendText(
              message.from,
              `Olá! Tudo bem? Sou a *Vanda Sousa*, especialista no Gel Pomada Canela de Velho, em instantes irei lhe atender.
Enquanto isso saiba mais um pouco do nosso produto, o gel é 100% natural!

A pomada canela de velho serve para:

✅ ARTRITE, ARTROSE E REUMATISMO
✅ DOR LOMBAR, COLUNA E QUADRIL
✅ INCHAÇO NO JOELHO, PERNAS E PÉS
✅ BURSITE

Preço de uma unidade:
🤑 R$197,00 🤑

🇧🇷 Entrega grátis para todo Brasil

Link para compra:
https://ev.braip.com/ref?pv=pro9wxee&af=afind98yv`
            );
            await client.sendText(
              message.from,
              "Estou lhe enviando alguns feedbacks sobre a pomada."
            );
          await client
            .sendImage(
              './images/social02.jpeg'
            )
            .catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
            await client
            .sendImage(
              './images/social01.jpeg'
            )
            .catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });
            return;
          }
        }
        // se já existir conversa e o usuário perguntar outras coisas segue o baile aqui abaixo
      } catch (er) {
        // console.log("aqui", er);
      }
    });
  } catch (er) {
    // console.log("aqui 2", er);
  }
}

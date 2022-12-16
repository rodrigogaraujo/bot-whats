const {format} = require('date-fns')
const express = require("express");
const venom = require("venom-bot");
const db = require("./database");

const chatRoute = require("./routers/chat");

const app = express();

app.use("/chats", chatRoute);

app.listen(4444, () => {
  console.log("servidor iniciado");
});

venom.create(
    //session
  `session${format(new Date(), 'dd-MM-yyyy HH:mm')}`, //Pass the name of the client you want to start the bot
    //catchQR
    (base64Qrimg, asciiQR, attempts, urlCode) => {
      console.log('Number of attempts to read the qrcode: ', attempts);
      console.log('Terminal qrcode: ', asciiQR);
      console.log('base64 image string qrcode: ', base64Qrimg);
      console.log('urlCode (data-ref): ', urlCode);
    },
    // statusFind
    (statusSession, session) => {
      console.log('Status Session: ', statusSession);
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
).then((client) => {
  try {
    start(client);
  } catch (er) {
    console.log(er);
  }
});

function start(client) {
  try {
    client.onMessage(async (message) => {
      if (message.isGroupMsg || message.type === 'reply') {
        return
      }
      try {
        if (message.body) {
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
            await client.sendVoice(message.from, './images/audio01.mp3').then((result) => {
              console.log('Result: ', result); //return object success
            }).catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
            });

            await client.sendText(
              message.from,
              `Olá! Tudo bem? Sou a *Brenda Rebeca*, especialista no Gel Pomada Canela de Velho, em instantes irei lhe atender.
Enquanto isso saiba mais um pouco do nosso produto, o gel é 100% natural!

A pomada canela de velho serve para:

✅ ARTRITE, ARTROSE E REUMATISMO
✅ DOR LOMBAR, COLUNA E QUADRIL
✅ INCHAÇO NO JOELHO, PERNAS E PÉS
✅ BURSITE`
            );
            return;
          }
          // se já existir conversa e o usuário perguntar outras coisas segue o baile aqui abaixo
          if (message.body.includes("valor")
            || message.body.toLowerCase().includes("preço")
            || message.body.toLowerCase().includes("custo")
            || message.body.toLowerCase().includes("preco")
            || message.body.toLowerCase().includes("valor?")
            || message.body.toLowerCase().includes("valor")
            || message.body.toLowerCase().includes("Valor?")
            || message.body.toLowerCase().includes("Preço?")
            || message.body.toLowerCase().includes("preço?")
            || message.body.toLowerCase().includes("Custo?")
            || message.body.toLowerCase().includes("custo?")) {
              await client.sendText(
                message.from,
                "Estou lhe enviando alguns feedbacks sobre a pomada."
              );
              await client
                .sendImage(
                  message.from,
                  './images/social01.jpeg',
                  'Feedback 01',
                  ''
                )
                .catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
              await client
                .sendImage(
                  message.from,
                  './images/social02.jpeg',
                  'Feedback 02',
                  ''
                )
                .catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
              await client
                .sendLinkPreview(
                  message.from,
                  'https://ev.braip.com/ref?pv=pro9wxee&af=afind98yv',
                  '\nR$ 197,00 a unidade'
                )
                .then((result) => {
                  console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
              return
          }

          if (message.body.toLowerCase().includes("envio")
            || message.body.toLowerCase().includes("frete")
            || message.body.toLowerCase().includes("enviar")
            || message.body.toLowerCase().includes("frete?")
            || message.body.toLowerCase().includes("enviar?")
            || message.body.toLowerCase().includes("Frete?")
            || message.body.toLowerCase().includes("Frete")
            || message.body.toLowerCase().includes("Enviar?")
            || message.body.toLowerCase().includes("Envio?")) {
            // Send audio file MP3
            await client.sendVoice(message.from, './images/audio3.mp3').then((result) => {
              console.log('Result: ', result); //return object success
            })
            await client.sendText(
              message.from,
              `🇧🇷 Entrega grátis para todo Brasil 🇧🇷 `
            );
            return
          }

          if (message.body.toLowerCase().includes("composição")
            || message.body.toLowerCase().includes("composicão")
            || message.body.toLowerCase().includes("composiçao")) {
            // Send audio file MP3
            await client.sendVoice(message.from, './images/audio4.mp3').then((result) => {
              console.log('Result: ', result); //return object success
            })
            await client.sendText(
              message.from,
              `🚨Composição da Canela de velho

✅ FLAVANOIDE
Substância conhecida e valorizada por ser um poderoso antioxidante capaz de reduzir os radicais livres que causam danos à saúde. Uma das principais funções dos flavonoides é prevenir ou retardar o desenvolvimento de alguns tipos de câncer.

✅ MENTOL NATURAL
Aplicado sobre a pele dilata os vasos sanguíneos causando sensação de frio seguida de analgesia, razão pela qual é usado associado à cânfora no gel redutor ou gel crioscópico.


✅ MICONIA ALBICANS
É capaz de proteger as células contra danos no DNA, o que previne doenças como o câncer e má formação no desenvolvimento do organismo esses triterpenos tem-se a analgésica, anti-inflamatória e antioxidante, atribuindo sua aplicabilidade principalmente nos casos de artrite, artrose e dores musculares`
            );
            return
          }

          if (message.body.toLowerCase().includes("realizar pedido")
            || message.body.toLowerCase().includes("faço a compra")
            || message.body.toLowerCase().includes("faço o pedido")) {
              await client
                .sendLinkPreview(
                  message.from,
                  'https://ev.braip.com/ref?pv=pro9wxee&af=afind98yv',
                  'Só clicar no link acima e realizar a sua compra, caso precise posso lhe ajudar.'
                )
                .then((result) => {
                  console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
            return
          }

          // if (message.body.toLowerCase().includes("como usar")
          //   || message.body.toLowerCase().includes("modo de uso")
          //   || message.body.toLowerCase().includes("aplicar")) {
          //     await client
          //       .sendLinkPreview(
          //         message.from,
          //         'https://ev.braip.com/ref?pv=pro9wxee&af=afind98yv',
          //         'Só clicar no link acima e realizar a sua compra, caso precise posso lhe ajudar.'
          //       )
          //       .then((result) => {
          //         console.log('Result: ', result); //return object success
          //       })
          //       .catch((erro) => {
          //         console.error('Error when sending: ', erro); //return object error
          //       });
          //   return
          // }
        }
      } catch (er) {
        // console.log("aqui", er);
      }
    });
  } catch (er) {
    // console.log("aqui 2", er);
  }
}

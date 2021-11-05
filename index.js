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

          console.log(message.from)

          const chatFrom = await Chats.findOne({ phone: message.from })
            .lean()
            .exec();
          if (!chatFrom) {
            const newChat = new Chats({
              phone: message.from,
              created_at: new Date(),
              type: "welcome",
            });

            try {
              await newChat.save();
            } catch (err) {
              console.log("erro ao salvar", err);
            }
            await client.sendText(
              message.from,
              "Olá eu sou a *Andressa*, sua atendente virtual.\nSeja bem vindo(a) a central de atendimento da *G3 Infotech*"
            );
            await client.sendText(
              message.from,
              "Selecione uma das opções:\n\n*1* - Suporte Técnico\n*2* - Financeiro\n*0* - Encerrar Atendimento."
            );

            return;
          }

          // caso seja primeiro atendimento
          if (chatFrom.type === "welcome") {
            switch (message.body) {
              case "1":
                console.log("upSup 1");
                const upSup = await Chats.updateOne(
                  { phone: message.from },
                  { type: "support" }
                );
                console.log("upSup 1", upSup);
                await client.sendText(
                  message.from,
                  "Selecione uma das opções:\n\n*1* - Falta de internet\n*2* - Lentidão\n*3* - Trocar senha\n*0* - Encerrar Atendimento."
                );
                break;

              case "2":
                console.log("upFinnancier 1");
                const upFinnancier = await Chats.updateOne(
                  { phone: message.from },
                  { type: "finnancier" }
                );
                console.log("upFinnancier 2", upFinnancier);
                await client.sendText(
                  message.from,
                  "Selecione uma das opções:\n\n*1* - PIX ou contas\n*2* - Link de pagamento\n*3* - Comprovante de pagamento\n*4* - Atraso de pagamento\n*0* - Encerrar Atendimento."
                );
                break;

              case "0":
                console.log("res 3");
                await Chats.deleteOne({ phone: message.from });
                await client.sendText(
                  message.from,
                  "Atendimento finalizado, agradecemos a preferência."
                );
                break;

              default:
                console.log("res default");
                await client.sendText(
                  message.from,
                  "Selecione uma das opções:\n\n*1* - Suporte Técnico\n*2* - Financeiro\n*0* - Encerrar Atendimento."
                );
                break;
            }
          }

          // financeiro opcao 02

          if (chatFrom.type === "finnancier" && !chatFrom.sub_type) {
            const Payment = db.Mongoose.model(
              "payment",
              db.PaymentSchema,
              "payment"
            );
            switch (message.body) {
              case "1":
                await Chats.updateMany(
                  { phone: message.from },
                  { type: "finnancier", sub_type: "pix" },
                  { upsert: true }
                );
                await Chats.deleteOne({ phone: message.from });
                await client.sendText(message.from, "PIX - CNPJ:");
                await client.sendText(message.from, "*19.326367/0001-28*");
                await client.sendText(
                  message.from,
                  "Realize o PIX e recomece o atendimento selecionando a opção *3* para o envio de comprovante."
                );
                break;

              case "2":
                const paymentNewLink = new Payment({
                  ...chatFrom,
                  created_at: new Date(),
                  sub_type: "payment_link",
                  active: true,
                });

                try {
                  await paymentNewLink.save();
                } catch (err) {
                  console.log("erro ao salvar", err);
                }
                await Chats.deleteOne({ phone: message.from });
                await client.sendText(
                  message.from,
                  "Em breve você receberá o seu link de pagamento, agradecemos a preferência."
                );
                break;

              case "3":
                await Chats.updateMany(
                  { phone: message.from },
                  { type: "finnancier", sub_type: "payment_comprove" },
                  { upsert: true }
                );
                await client.sendText(
                  message.from,
                  "Envie seu comprovante de pagamento e aguarde uns instantes.."
                );
                break;

              case "4":
                await Chats.updateMany(
                  { phone: message.from },
                  { type: "finnancier", sub_type: "payment_await" },
                  { upsert: true }
                );
                await client.sendText(
                  message.from,
                  "Informe a quantidade de dias que deseja que a gente espere e iremos analisar e lhe retornar o mais breve possivel."
                );
                break;

              case "0":
                console.log("res 3");
                await Chats.deleteOne({ phone: message.from });
                await client.sendText(
                  message.from,
                  "Atendimento finalizado, agradecemos a preferência."
                );
                break;

              default:
                await Chats.updateMany(
                  { phone: message.from },
                  { type: "finnancier", sub_type: null },
                  { upsert: true }
                );
                await client.sendText(
                  message.from,
                  "Selecione uma das opções:\n\n*1* - PIX ou contas\n*2* - Link de pagamento\n*3* - Comprovante de pagamento\n*4* - Atraso de pagamento\n*0* - Encerrar Atendimento."
                );
                break;
            }
          }

          // comprovante de pagamento
          if (chatFrom.type === "finnancier" && chatFrom.sub_type) {
            switch (chatFrom.sub_type) {
              case "payment_comprove":
                if (message.type === "image") {
                  await client.sendText(
                    message.from,
                    "Recebemos o seu comprovante de pagamento, em instantes será dado baixa no boleto do mês caso tudo esteja ok."
                  );
                  await client.sendText(
                    message.from,
                    "Atendimento finalizado, agradecemos a preferência."
                  );
                  await Chats.deleteOne({ phone: message.from });
                }
                break;

              case "payment_await":
                if (message.body) {
                  const paymentNewLink = new Payment({
                    ...chatFrom,
                    description_days: message.body,
                    created_at: new Date(),
                    sub_type: "payment_link",
                    active: true,
                  });
  
                  try {
                    await paymentNewLink.save();
                  } catch (err) {
                    console.log("erro ao salvar", err);
                  }
                  await client.sendText(
                    message.from,
                    "Recebemos a sua solicitação, em breve você terá um retorno."
                  );
                  await client.sendText(
                    message.from,
                    "Atendimento finalizado, agradecemos a preferência."
                  );
                  await Chats.deleteOne({ phone: message.from });
                }
                break;
              default:
                break;
            }
          }
          // suport opção 01
          if (
            chatFrom.type === "support" &&
            !chatFrom.sub_type &&
            !chatFrom.name
          ) {
            switch (message.body) {
              case "1":
                console.log("sem internet 1");
                const upSup = await Chats.updateMany(
                  { phone: message.from },
                  { type: "support", sub_type: "internet_out" },
                  { upsert: true }
                );
                console.log("sem internet 1", upSup);
                await client.sendText(
                  message.from,
                  "Precisamos saber o seu nome completo *como no seu carnê*.\nSeguido por o seu apelido *caso possua*.\n\nExemplo:\nNome Darlanny Diniz\nApelido Cael.\n\n\n*0* - Para encerrar Atendimento."
                );
                break;

              case "2":
                console.log("lentidão 1");
                const upSupInternetSmall = await Chats.updateMany(
                  { phone: message.from },
                  { type: "support", sub_type: "internet_small" },
                  { upsert: true }
                );
                console.log("lentidão 1", upSupInternetSmall);
                await client.sendText(
                  message.from,
                  "Precisamos saber o seu nome completo *como no seu carnê*.\nSeguido por o seu apelido *caso possua*.\n\nExemplo:\nNome Darlanny Diniz\nApelido Cael.\n\n\n\n\n*0* - Encerrar Atendimento."
                );
                break;

              case "3":
                console.log("trocar senha 1");
                const upSupChangePas = await Chats.updateMany(
                  { phone: message.from },
                  { type: "support", sub_type: "change_pass" },
                  { upsert: true }
                );
                console.log("trocar senha 1", upSupChangePas);
                await client.sendText(
                  message.from,
                  "Precisamos saber o seu nome completo *como no seu carnê*.\nSeguido por o seu apelido *caso possua*.\n\nExemplo:\nDarlanny Diniz\nCael.\n\n\n\n\n*0* - Encerrar Atendimento."
                );
                break;

              case "0":
                console.log("res 3");
                await Chats.deleteOne({ phone: message.from });
                await client.sendText(
                  message.from,
                  "Atendimento finalizado, agradecemos a preferência."
                );
                break;

              default:
                console.log("res default - support");
                await client.sendText(
                  message.from,
                  "Selecione uma das opções:\n\n*1* - Falta de internet\n*2* - Lentidão\n*3* - Trocar senha\n*0* - Encerrar Atendimento."
                );
                break;
            }
          }

          // cria ordem de serviço
          const ServiceOrders = db.Mongoose.model(
            "service_orders",
            db.ServiceOrderSchema,
            "service_orders"
          );
          if (
            chatFrom.type === "support" &&
            chatFrom.sub_type &&
            !chatFrom.name
          ) {
            switch (message.body) {
              case "0":
                console.log("res 3");
                await Chats.deleteOne({ phone: message.from });
                await client.sendText(
                  message.from,
                  "Atendimento finalizado, agradecemos a preferência."
                );
                break;
              default:
                const newServiceOrder = new ServiceOrders({
                  ...chatFrom,
                  name: message.body,
                  created_at: new Date(),
                  active: true,
                });

                try {
                  await newServiceOrder.save();
                } catch (err) {
                  console.log("erro ao salvar", err);
                }
                await Chats.deleteOne({ phone: message.from });
                await client.sendText(
                  message.from,
                  `Sua ordem de serviço foi criada e em breve um técnico irá até a sua casa. Obrigado pela preferência. ${
                    new Date().getHours() > 18
                      ? "Tenha uma ótima noite"
                      : "Tenha um ótimo dia."
                  }`
                );
                break;
            }
          }
        }
      } catch (er) {
        // console.log("aqui", er);
      }
    });
  } catch (er) {
    // console.log("aqui 2", er);
  }
}

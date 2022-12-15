const mongoose = require("mongoose");

const uri =
  "mongodb://caderninho:108094Ro@caderninho.g3infotech.app:17053/caderninho?authSource=caderninho&readPreference=primary&appname=helpcar%20Compass&directConnection=true&ssl=false";

mongoose.connect(uri, { useNewUrlParser: true });

// const conn = mongoose.connection

// conn.on('open', () => {
//   console.log('conectado')
// })

const chatSchema = new mongoose.Schema(
  {
    phone: String,
    type: String,
    sub_type: String,
    name: String,
    created_at: Date,
  },
  { collection: "chats" }
);

module.exports = {
  Mongoose: mongoose,
  ChatSchema: chatSchema,
};

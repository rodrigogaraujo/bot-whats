const mongoose = require("mongoose");

const uri =
  "";

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

const serviceOrderSchema = new mongoose.Schema(
  {
    phone: String,
    type: String,
    sub_type: String,
    name: String,
    active: Boolean,
    created_at: Date,
  },
  { collection: "service_orders" }
);

const paymentSchema = new mongoose.Schema(
  {
    phone: String,
    type: String,
    active: Boolean,
    sub_type: String,
    description_days: String,
    created_at: Date,
  },
  { collection: "payment" }
);

module.exports = {
  Mongoose: mongoose,
  ChatSchema: chatSchema,
  ServiceOrderSchema: serviceOrderSchema,
  PaymentSchema: paymentSchema,
};

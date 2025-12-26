let mongoose = require("mongoose");
let Schema = mongoose.Schema;


const MemberSchema = new mongoose.Schema({
  taxNumber: { type: Number, required: true },
  cash: Number,
  paymentRegular: Boolean,
  photo: String,
  dataCreated: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});


let Member = mongoose.model("Member", MemberSchema);


module.exports = Member;

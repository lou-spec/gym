let mongoose = require("mongoose");
let scopes = require("./scopes");

let Schema = mongoose.Schema;

let RoleSchema = new Schema({
  name: { type: String, required: true },
  scope: [
    {
      type: String,
      enum: [scopes.Admin, scopes.Member, scopes.NonMember, scopes.Anonimous, scopes.Trainer, scopes.User],
    },
  ],
});

// create a schema
let UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: RoleSchema },
  birthDate: { type: Date },
  address: { type: String, required: false },
  country: { type: String, required: false },
  profileImage: { type: String, required: false },

  resetPasswordToken: { type: String, required: false },
  resetPasswordExpiry: { type: Date, required: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  inviteCode: { type: String, unique: true, sparse: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
});

let User = mongoose.model("User", UserSchema);

// make this available to our users in our Node applications
module.exports = User;

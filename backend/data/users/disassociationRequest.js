let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let DisassociationRequestSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: { type: String },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

let DisassociationRequest = mongoose.model("DisassociationRequest", DisassociationRequestSchema);

module.exports = DisassociationRequest;

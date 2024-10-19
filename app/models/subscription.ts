import { Decimal128 } from 'mongodb';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planName: { type: String, required: true },
    price: { type: Decimal128, required: true },
    createdAt: { type: Date, default: Date.now, required: true }
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;

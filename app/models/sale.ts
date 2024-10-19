import { Decimal128 } from "mongodb";
import mongoose, { Schema } from "mongoose";

const saleSchema = new Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    saleDate: { type: Date, default: Date.now, required: true },
    price: { type: Decimal128, required: true },
    quantity: { type: Number, required: true },
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;

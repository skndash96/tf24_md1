import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;

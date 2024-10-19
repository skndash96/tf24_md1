import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateJoined: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
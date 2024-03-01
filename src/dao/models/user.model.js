import mongoose from 'mongoose';

const userCollection = 'user';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    admin: { type: Boolean, default: false }
});

export const userModel = mongoose.model('User', userSchema, userCollection);

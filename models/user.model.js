import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500,
    },
    password: { 
        type: String,
        required: true,
        minlength: 6,
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
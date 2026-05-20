import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenandSetCookie from "../../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;
        
        const user = await User.findOne({ username, email });
        if (user) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullname,
            username,
            email,
            password: hashedPassword
        });
        if (newUser) {
            await generateTokenandSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({ message: "User created successfully" });
        } else {
            res.status(400).json({ message: "Failed to create user" });
        } 
    }
    
    
    catch (error) {
        res.status(500).json({ message: "Error occurred while signing up" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user?.password || "");
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        await generateTokenandSetCookie(user._id, res);

        res.status(200).json({ message: "Logged in successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while logging in" });
    }
}

export const logout = (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV && 
                             process.env.NODE_ENV.toLowerCase() === "production" && 
                             process.env.FRONTEND_URL;
        res.cookie("token", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while logging out" });  
    }
}
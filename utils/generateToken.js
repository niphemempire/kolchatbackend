import jwt from "jsonwebtoken";

const generateTokenandSetCookie = (userId, res) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }
    
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
    res.cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true,
        sameSite: "lax",
        // secure: false // Set to false for development (HTTP), true for production (HTTPS)
    });
}   

export default generateTokenandSetCookie; 
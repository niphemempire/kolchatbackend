import jwt from "jsonwebtoken";

const generateTokenandSetCookie = (userId, res) => {
    const jwtSecret = process.env.JWT_SECRET?.trim();
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }

    const token = jwt.sign({ id: userId }, jwtSecret, { expiresIn: "15d" });
    const isProduction =
        process.env.NODE_ENV &&
        process.env.NODE_ENV.toLowerCase() === "production";
    res.cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
    });
}   

export default generateTokenandSetCookie; 
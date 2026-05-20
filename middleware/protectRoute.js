import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
    try {
        const tokenFromCookie = req.cookies.token;
        if (!tokenFromCookie) {
            return res.status(401).json({ Error: "Unauthorized - No token" });
        }   

        const decoded = jwt.verify(tokenFromCookie, process.env.JWT_SECRET);
       
        if (!decoded) {
            return res.status(401).json({ Error: "Unauthorized - Invalid token" });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ Error: "Unauthorized - User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({ Error: error.message || "internal server error" });
    }
}

export default protectRoute;
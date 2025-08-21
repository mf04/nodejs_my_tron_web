import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config.js"

// 中间件：验证 JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: '需要提供访问令牌' });
    }
    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            console.error('JWT 验证失败:', err.message);
            return res.status(403).json({ message: '令牌无效或已过期' });
        }
        req.user = decodedPayload;
        next();
    });
};


export {
    authenticateToken,
}
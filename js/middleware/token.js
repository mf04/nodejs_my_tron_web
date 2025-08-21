import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config.js"
import { reqestWrapper } from "./util.js"

// 中间件：验证 JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.send(reqestWrapper("需要提供访问令牌", "fail"));
    }
    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            return res.send(reqestWrapper("令牌无效或已过期", "fail"));
        }
        req.user = decodedPayload;
        next();
    });
};


export {
    authenticateToken,
}
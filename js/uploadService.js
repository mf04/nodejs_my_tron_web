import multer from "multer"
import path from "path"

// 配置存储方式
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "js/uploads/"); // 存储路径
    },
    filename: function (req, file, cb) {
        // 防止文件名冲突：时间戳 + 原始后缀
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// 初始化上传中间件
export const uploadMiddleware = multer({ storage });

import crypto from "crypto";
import md5 from "md5";
import { cryptoSalt as salt } from "./config.js";

const algorithm = "aes-256-cbc";

const saltMd5 = md5(salt);

const key = crypto.createHash("sha256").update(saltMd5).digest();

class CryptoService {

    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + ":" + encrypted;
    }

    decrypt(encryptedText) {
        const parts = encryptedText.split(":");
        const iv = Buffer.from(parts[0], "hex");
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
}

const cryptoService = new CryptoService;

export default cryptoService;

const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    // Validar que el encabezado de autorización esté presente
    if (!req.headers || !req.headers.authorization) {
        return res.status(403).json({ error: "Token requerido" });
    }

    // Extraer el token del encabezado Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({ error: "Formato de token inválido" });
    }

    // Verificar y decodificar el token
    jwt.verify(token, process.env.JWT_SECRET || "holamundo", (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido" });
        }

        // Adjuntar el usuario decodificado a req.usuario
        req.usuario = decoded;
        next();
    });
};

module.exports = verificarToken;
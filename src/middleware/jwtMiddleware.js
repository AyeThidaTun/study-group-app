require("dotenv").config();
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;   
const tokenAlgorithm = process.env.JWT_ALGORITHM;

// The generateToken function generates a token using the payload and options provided.
module.exports.generateToken = function (req, res, next) {

    const payload = {
        userId: res.locals.userId,
        email: res.locals.email,
        timestamp: new Date()
    };

    const options = {
        algorithm: tokenAlgorithm,
        expiresIn: tokenDuration,
    };

    const callback = (err, token) => {
        if (err) {
            console.error("Error jwt:", err);
            res.status(500).json(err);
        } else {
            console.log("Token generated:", token);
            res.locals.token = token;
            res.locals.message = "Success"; // Set the success message here for playwright testing
            next();
        }
    };

    jwt.sign(payload, secretKey, options, callback); // Use callback directly, no need to assign to token variable
};

// The sendToken function sends the token to the client.
module.exports.sendToken = function (req, res) {
    res.status(200).json({
        message: res.locals.message,
        token: res.locals.token,
        email: res.locals.email,
        userId: res.locals.userId,
        userRole: res.locals.userRole,
        isTutor: res.locals.isTutor,
    });
};

// The verifyToken function verifies the token provided in the request header.
module.exports.verifyToken = function (req, res, next){
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    const callback = function (err, decoded) {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }

        res.locals.email = decoded.email;
        res.locals.userId = decoded.userId,
        res.locals.tokenTimestamp = decoded.timestamp;

        next();
    };

    jwt.verify(token, secretKey, callback);
};

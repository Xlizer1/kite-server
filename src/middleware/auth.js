const jwt = require("jsonwebtoken");
const { resultObject } = require("../helpers/common");
const { CustomError } = require("./errorHandler");

const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers["jwt"];

        if (!token) {
            throw new CustomError("Access token is required", 401);
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set in environment variables");
            throw new CustomError("Server configuration error", 500);
        }

        try {
            const decoded = jwt.verifyUserToken(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                throw new CustomError("Token has expired", 401);
            }
            throw new CustomError("Invalid token", 401);
        }
    } catch (error) {
        console.error("Authentication error:", error);
        return res
            .status(error.statusCode || 500)
            .json(
                resultObject(
                    false,
                    error instanceof CustomError ? error.message : "Authentication failed",
                    null,
                    error instanceof CustomError ? error.statusCode : 500
                )
            );
    }
};

module.exports = {
    authenticateToken,
};

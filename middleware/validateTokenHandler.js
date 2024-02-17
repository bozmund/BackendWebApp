import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {
	const token = req.headers.authorization;

	// Check if token is present
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	// Perform token validation logic here
	// ...
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: "Forbidden" });
		}
		req.user = decoded.user;
	});

	// If token is valid, proceed to the next middleware or route handler
	next();
};

export default validateToken;

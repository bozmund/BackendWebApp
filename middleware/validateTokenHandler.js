import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {
	let token = req.headers.authorization;

	token = token.split(" ")[1];

	// Check if token is present
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	// Perform token validation logic here
	// ...
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return next(err); // Pass the error to the error handling middleware
		}
		req.user = decoded.user;
		next();
	});
};

export default validateToken;

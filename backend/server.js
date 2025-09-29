
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { db } from "./config/db.js";
import { registrationModel } from "./models/registrationModel.js";
import { userModel } from "./models/userModel.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { seedAdmin } from "./controllers/adminController.js";

// Passport and session setup
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";

dotenv.config();
console.log('JWT_SECRET used in server:', process.env.JWT_SECRET);
const app = express();

app.use(cors({
	origin: "http://localhost:5173", // adjust to your frontend URL
	credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Session middleware
app.use(session({
	secret: process.env.SESSION_SECRET || "your_secret",
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false } // set to true if using https
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth strategy - commented out for now
// passport.use(new GoogleStrategy({
// 	clientID: process.env.GOOGLE_CLIENT_ID,
// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 	callbackURL: "/api/auth/google/callback"
// }, async (accessToken, refreshToken, profile, done) => {
// 	try {
// 		const googleId = profile.id;
// 		const email = profile.emails[0].value;
// 		const name = profile.displayName;
// 		db.query('SELECT * FROM users WHERE googleId = ?', [googleId], (err, results) => {
// 			if (err) return done(err);
// 			if (results.length) return done(null, results[0]);
// 			db.query('INSERT INTO users (name, email, googleId, role) VALUES (?, ?, ?, ?)', [name, email, googleId, 'user'], (err, res) => {
// 				if (err) return done(err);
// 				db.query('SELECT * FROM users WHERE id = ?', [res.insertId], (err, user) => done(err, user[0]));
// 			});
// 		});
// 	} catch (error) {
// 		done(error);
// 	}
// }));

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
		done(err, results[0]);
	});
});

registrationModel(db);
userModel(db);

seedAdmin();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/admin", adminRoutes);

// Google OAuth routes - commented out for now
// app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// app.get("/api/auth/google/callback",
// 	passport.authenticate("google", { failureRedirect: "/login", session: true }),
// 	(req, res) => {
// 		// Generate JWT token for the authenticated user
// 		const JWT_SECRET = process.env.JWT_SECRET || 'necadmin';
// 		const token = jwt.sign({
// 			id: req.user.id,
// 			email: req.user.email,
// 			role: req.user.role,
// 			passwordChanged: true // Assuming Google users don't need password change
// 		}, JWT_SECRET, { expiresIn: '24h' });

// 		// Redirect to frontend registration page with token
// 		res.redirect(`http://localhost:5173/ICoDSES/paper-status?token=${token}`);
// 	}
// );

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

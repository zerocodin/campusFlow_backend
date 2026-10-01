const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const studentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide your name"],
			trim: true,
			maxlength: [60, "Name cannot exceed 60 characters"],
		},
		email: {
			type: String,
			required: [true, "Please provide your email"],
			unique: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
		},
		password: {
			type: String,
			required: [true, "Please provide a password"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		role: {
			type: String,
			enum: ["student", "cr"],
			default: "student",
		},
		studentId: {
			type: String,
			required: [true, "Student ID is required"],
			unique: true,
			trim: true,
		},
        faculty: {
			type: String,
			required: [true, "Faculty is required"],
			trim: true,
		},
		department: {
			type: String,
			required: [true, "Department is required"],
			trim: true,
		},
		batch: {
			type: String,
			required: [true, "Batch is required"],
			trim: true,
		},
		semester: {
			type: String,
			required: [true, "Semester is required"],
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		profileImage: {
			type: String,
			default: "default-avatar.png",
		},
		//   Verification flags  
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isStudentVerified: {
			// Admin approves student data
			type: Boolean,
			default: false,
		},
		//   Email verification tokens  
		emailVerificationToken: String,
		emailVerificationExpire: Date,
		//   Password reset  
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		//   Tracking  
		lastLogin: {
			type: Date,
			default: null,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

// Encrypt password before save
studentSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Compare password
studentSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT
studentSchema.methods.getSignedJwtToken = function () {
	return jwt.sign(
		{ id: this._id, role: this.role, type: "student" },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRE },
	);
};

// Generate email verification token
studentSchema.methods.getEmailVerificationToken = function () {
	const token = crypto.randomBytes(32).toString("hex");
	this.emailVerificationToken = crypto
		.createHash("sha256")
		.update(token)
		.digest("hex");
	this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24h
	return token;
};

// Generate password reset token
studentSchema.methods.getResetPasswordToken = function () {
	const token = crypto.randomBytes(32).toString("hex");
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(token)
		.digest("hex");
	this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
	return token;
};

module.exports = mongoose.model("student", studentSchema);

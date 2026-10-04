const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const staffSchema = new mongoose.Schema(
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
			enum: ["super_admin", "teacher", "iot"],
			required: true,
		},
		employeeId: {
			type: String,
			trim: true,
			sparse: true,
		},
		faculty: {
			type: String,
			required: [true, "Faculty is required"],
			trim: true,
		},
		department: {
			type: String,
			trim: true,
		},
		designation: {
			type: String,
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
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isUserVerified: {
			// super_admin approves teacher and iot
			type: Boolean,
			default: false,
		},
		emailVerificationToken: String,
		emailVerificationExpire: Date,
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		lastLogin: {
			type: Date,
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

staffSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

staffSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

staffSchema.methods.getSignedJwtToken = function () {
	return jwt.sign(
		{ id: this._id, role: this.role, type: "staff" },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRE },
	);
};

staffSchema.methods.getEmailVerificationToken = function () {
	const token = crypto.randomBytes(32).toString("hex");
	this.emailVerificationToken = crypto
		.createHash("sha256")
		.update(token)
		.digest("hex");
	this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
	return token;
};

staffSchema.methods.getResetPasswordToken = function () {
	const token = crypto.randomBytes(32).toString("hex");
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(token)
		.digest("hex");
	this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
	return token;
};

module.exports = mongoose.model("staff", staffSchema);

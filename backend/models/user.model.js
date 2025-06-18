import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	fullname: {
		type: String,
		required: true,
		minLength: 6,
		maxLength: 30,
	},
	username: {
		type: String,
		required: true,
		minLength: 6,
		maxLength: 30,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minLength: 6,
	},
	email: {
		type: String,
		required: true,
		maxLength: 50,
		unique: true,
	},
	profileImg: {
		type: String,
		default: "",
	},
	coverImg: {
		type: String,
		default: "",
	},
	bio: {
		type: String,
		default: "",
		maxLength: 150,
	},
	link: {
		type: String,
		default: "",
	},
	followers: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "User",
		default: [],
	},
	followeing: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "User",
		default: [],
	},
	notifications: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "Notiffication",
		default: [],
	},
	likedPosts: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "Post",
		default: [],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	watchlist: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	}],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
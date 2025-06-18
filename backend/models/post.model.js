import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	text: {
		type: String,
		default: "",
	},
	img: {
		type: String,
		default: "",
	},
	likes: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "User",
		default: [],
	},
	comments: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		}
	}],
	createdAt: {
		type: Date,
		default: Date.now,
	},
    movieTitle: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    director: {
        type: String,
        required: true,
    },
    synopsis: {
        type: String,
        required: true,
    },
	ratings: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		value: {
			type: Number,
			min: 1,
			max: 5,
		}
	}],
	avgRating: {
		type: Number,
		default: 0,
	}
});

const Post = mongoose.model("Post", postSchema);

export default Post;
import User from "../models/user.model.js"
import cloudinary from "cloudinary";
import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }

        if (!text && !img) {
            return res.status(400).json({ error: "Post must have text or image" })
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img
        })

        await newPost.save();
        res.status(201).json(newPost);


    } catch (error) {
        console.log(`Error in create post controller: {error}`)
        res.status(500).json({ error: "Internal server Error" })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findOne({ _id: id });
        if (!post) {
            return res.status(400).json({ error: "Post not found" })
        }
        if (post.user.toString() !== req.user._id.toString()) {
            res.status(401).json({ error: "You are not authorized to delete this post" })
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.destroy(imgId);
        }
        await Post.findByIdAndDelete({ _id: id })
        res.status(200).json({ message: "Post deleted successfully" })

    } catch (error) {
        console.log(`Error in delete post controller: ${error}`)
        res.status(500).json({ error: "Internal server Error" })
    }
}

export const createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Comment text is required" })
        }
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        const comment = {
            user: userId,
            text
        }

        post.comments.push(comment);
        await post.save();
        res.status(200).json(post)
    } catch (error) {
        console.log(`Error in comment post controller: ${error}`)
        res.status(500).json({ error: "Internal server Error" })
    }
}


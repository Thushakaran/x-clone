import User from "../models/user.model.js";
import Notification from "../models/notification.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "cloudinary"


export const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username })

        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }

        res.status(200).json(user)
    } catch (error) {
        console.log(`Error in grt User profile controller: ${error}`)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById({ _id: id })
        const currentUser = await User.findById({ _id: req.user._id })

        if (id === req.user._id) {
            return res.status(400).json({ error: "You can't unfollow/follow" })
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "user not found" })
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // unfollow
            await User.findByIdAndUpdate({ _id: id }, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { following: id } })
            res.status(200).json({ message: "Unfollow successfully" })
        } else {
            // follow
            await User.findByIdAndUpdate({ _id: id }, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate({ _id: req.user._id }, { $push: { following: id } })
            // send notification
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save();
            res.status(200).json({ message: "Follow successfully" })
        }


    } catch (error) {
        console.log(`Error in follow and unfollow controller: ${error}`)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({ _id: userId }).select("-password")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            }, {
                $sample: {
                    size: 10
                }
            }
        ])

        const fillteredUser = users.filter((user) => !userFollowedByMe.following.includes(user._id))
        const suggestedUsers = fillteredUser.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null))
        res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log(`Error in getSuggestedUsers controller: ${error}`)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, fullname, email, currentPassword, newPassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;
        let user = await User.findById({ _id: userId })
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both the new password and current password" })
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if (!isMatch) {
                return res.status(400).json({ error: "Current Password is incorrect" })
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password Must have atleast 6 char" })
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt)
        }

        // if (profileImg) {
        //     await cloudinary.uploader.detroy(user.profileImg.split("/").pop().split(".")[0])
        //     const uploadedResponse = await cloudinary.uploder.upload(profileImg);
        //     profileImg = uploadedResponse.secure_url;
        // }

        // if (coverImg) {
        //     await cloudinary.uploader.detroy(user.coverImg.split("/").pop().split(".")[0])
        //     const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        //     coverImg = uploadedResponse.secure_url;
        // }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null
        return res.status(200).json(user)

    } catch (error) {
        console.log(`Error in updateUser controller: ${error}`)
        res.status(500).json({ error: "Internal server error" })
    }
}
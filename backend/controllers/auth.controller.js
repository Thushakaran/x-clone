import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { username, fullname, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email Format" })
        }

        const existingEmail = await User.findOne({ email })
        const existingUsername = await User.findOne({ username })

        if (existingEmail || existingUsername) {
            return res.status(400).json({ error: "Already Existing User or Email" })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must have atleast 6 char length" })
        }

        // hashing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            fullname,
            email,
            password: hashedPassword
        })

        if (user) {
            generateToken(user._id, res)
            await user.save();
            res.status(200).json({
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profi1eImg: user.profi1eImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link
            })
        } else {
            res.status(400).json({ error: "Invalid User Data" })
        }

    } catch (error) {
        console.log(`Error in signup controller: ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" })
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profi1eImg: user.profi1eImg,
            coverImg: user.coverImg,
            bio: user.bio,
            link: user.link
        })

    } catch (error) {
        console.log(`Error in login controller : ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout successfully" })
    } catch (error) {
        console.log(`Error in logout controller : ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).select("-password")
        res.status(200).json(user);
    } catch {
        console.log(`Error in getMe controller : ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
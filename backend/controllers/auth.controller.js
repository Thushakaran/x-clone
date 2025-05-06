import User from "../models/user.model.js"
import bcrypt from "bcryptjs";

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

        const newUser = new User({
            username,
            fullname,
            email,
            password: hashedPassword
        })

        if (newUser) {
            await newUser.save();
            res.status(200).json({
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profi1eImg: newUser.profi1eImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link
            })
        } else {
            res.status(400).json({ error: "Invalid User Data" })
        }

    } catch (error) {
        console.log(`Error in signup controller: ${error}`)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
export const login = (req, res) => {
    res.send("login controller");
}
export const logout = (req, res) => {
    res.send("logout controller");
}
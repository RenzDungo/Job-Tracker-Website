import { Router } from "express"
import bcrypt from "bcrypt"
import {pool} from "../db"

const userrouter = Router();

userrouter.post("/users/create", async(req,res) => {
    const { email , password } = req.body;
    
    //Error Check
    if (!email || !password) {
        return res.status(400).json({error: "Email and Password Fields are required"})
    }
    try {
        //Hash the Password
        const hashedPassword = await bcrypt.hash(password,12);
        const result = await pool.query(
            `
            INSERT INTO users (email, password)
            VALUES ($1, $2)
            RETURNING email
            `,
            [email, hashedPassword]
        )
        return res.status(201).json(result)
    } catch (err: any) {
        if (err.code === "23505") {
            return res.status(409).json({error:"Email already Exists"})
        }
        console.error("Create user error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
})

userrouter.get("/users/id/:id", async(req,res) => {
    const {id} = req.params;
    try{
        const result = await pool.query(
            `
            SELECT id, email
            FROM users
            WHERE id = $1
            `,
            [id]
        )
        if (result.rows.length===0) {
            return res.status(404).json({error:"User not found"})
        }
        res.status(200).json(result.rows[0])
    } catch (err){
        console.error("Error fetching user: ", err)
        res.status(500).json({error:"Internal server error"})
    }
})

userrouter.get("/users/email/:email", async(req,res) => {
    const {email,} = req.params;
    try{
        const result = await pool.query(
            `
            SELECT id, email
            FROM users
            WHERE email = $1
            `,
            [email]
        )
        if (result.rows.length===0) {
            return res.status(404).json({error:"User not found"})
        }
        res.status(200).json(result.rows[0])
    } catch (err){
        console.error("Error fetching user: ", err)
        res.status(500).json({error:"Internal server error"})
    }
})
userrouter.post("/users/login", async(req,res) => {
    const {email,password} = req.body;
    if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
    }
    try{
        const result = await pool.query(
            `
            SELECT * FROM users
            WHERE email = $1
            `,
            [email]
        )
        if (result.rows.length===0) {
            return res.status(404).json({error:"Invalid Credentials"})
        }
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.status(200).json({
            id: user.id,
            email: user.email
        });
    } catch (err){
        console.error("Error fetching user: ", err)
        res.status(500).json({error:"Internal server error"})
    }
})
export default userrouter

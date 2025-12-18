import {pool} from "../db"
import { Router } from "express"
const jobapprouter = Router();

jobapprouter.post("/create/user/:id", async(req,res)=> {
    const {name, position, status, link, platform, salary, notes, month, day, year} = req.body
    const {id} = req.params;

    if (!name || !position || !status || !link || !platform){
        return res.status(400).json({error:"Missing required fields"})
    }
    const today = new Date();

    const finalMonth = month ?? today.getMonth() + 1;
    const finalDay   = day ?? today.getDate();
    const finalYear  = year ?? today.getFullYear();
    try{
        const result = await pool.query(
            `
            INSERT INTO jobapptable (name, position, status, link, platform, salary, notes, month, day, year, userid)
            SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, u.id
            FROM users u
            WHERE u.id = $11
            RETURNING *
            `,
            [name, position, status, link, platform, salary, notes, finalMonth, finalDay, finalYear, id]
        )
        if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
        }
        return res.status(201).json(result)
    } catch (err){
        console.error("Create Job App Error", err);
        return res.status(500).json({error: "Internal server error"})
    }
})

jobapprouter.get("/get/:id", async(req,res)=>{
    const {id} = req.params;

    try{
        const result = await pool.query(
            `
            SELECT * FROM jobapptable
            WHERE id = $1
            `,
            [id]
        )
        return res.status(200).json(result.rows[0])
    } catch (err){
        console.error("Error fetching Job Application: ", err)
        res.status(500).json({error:"Internal Server Error"})
    }
})

jobapprouter.get("/user/:id", async(req,res)=>{
    const {id} = req.params;
    //User Checking
    const userCheck = await pool.query(
        `SELECT 1 FROM users WHERE id = $1`,
        [id]
    );

    if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
    }
    try{
        const result = await pool.query(
            `
            SELECT * FROM jobapptable
            WHERE userid = $1
            `,
            [id]
        )
        return res.status(200).json(result.rows);
    } catch (err){
        console.error("Error fetching Job Application: ", err)
        res.status(500).json({error:"Internal Server Error"})
    }
})

jobapprouter.delete("/remove/:id/user/:userid", async(req,res)=>{
    const {id, userid} = req.params;
    
    try{
        const result = await pool.query(
            `
            DELETE FROM jobapptable
            WHERE jobid = $1 AND userid = $2
            `,
            [id, userid]
        )
        if (result.rows.length === 0) {
         return res.status(404).json({ error: "Job application not found" });
        }
        return res.status(200).json({
            message: "Job application deleted successfully",
            deleted: result.rows[0]
        });
    } catch (err){
        console.error("Error deleting Job Application:", err)
        res.status(500).json({error:"Internal Server Error"})
    }
})
jobapprouter.put("/update/:jobappid/user/:userid", async (req,res)=>{
    const {jobappid,userid} = req.params;
    const {name, position, status, link, platform, salary, notes} = req.body
    //Dynamic Query
    const fields=[];
    const values=[];
    let index = 1;
    if (name){
        fields.push(`name = $${index++}`)
        values.push(name)
    }
    if (position){
        fields.push(`position = $${index++}`)
        values.push(position)
    }
    if (status){
        fields.push(`status = $${index++}`)
        values.push(status)
    }
    if (link){
        fields.push(`link = $${index++}`)
        values.push(link)
    }
    if (platform){
        fields.push(`platform = $${index++}`)
        values.push(platform)
    }
    if (salary){   
        fields.push(`salary = $${index++}`)
        values.push(salary)
    }
    if (notes){
        fields.push(`notes = $${index++}`)
        values.push(notes)
    }
    if (fields.length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
    }

    try{
        const result = await pool.query(
            `
            UPDATE jobapptable
            SET ${fields.join(", ")}
            where jobid = $${index} AND userId = $${index +1}
            RETURNING *
            `,
            [...values, jobappid, userid]
        )
        if (result.rows.length === 0) {
        return res.status(404).json({ error: "Job application not found" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})

jobapprouter.get("/:userid", async(req,res)=>{
    const {userid} = req.params
    const {sort, order, page="1", limit="20"} =req.query
    const sortMap: Record<string,string> ={
        jobid:"jobid",
        name: "name",
        position:"position",
        status:"status",
        link:"link",
        platform:"platform",
        date: "year, month, day",
    }
    const sortKey= sortMap[sort as string] ?? "jobid"

    const sortOrder =
    typeof order === "string" && order.toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query(
        `
        SELECT * 
        FROM jobapptable
        WHERE userid = $1
        ORDER BY ${sortKey} ${sortOrder}
        LIMIT $2 OFFSET $3
        `,
        [userid, limit, offset]
    )
    return res.status(200).json(result.rows)
})

export default jobapprouter
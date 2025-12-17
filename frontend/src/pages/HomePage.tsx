import {Container, Card, Table, Dropdown, Stack, Form} from "react-bootstrap"
import { useUser } from "../PageContext"
import { useState, useEffect } from "react"
const API_URL = import.meta.env.VITE_API_URL;
interface JobApp{
    jobid: number;
    name: string,
    position: string,
    status: string,
    link: string,
    platform: string,
    salary?: number|null,
    notes?: string|null,
    month: number,
    day: number,
    year: number,
}
export default function Homepage(){
    const {userId} = useUser();
    const [jobapps,setJobApps] =useState<JobApp[]>([])
    const [errormessage, setErrorMessage] =useState("")
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<keyof JobApp | null>(null);
    const [editValue, setEditValue] = useState("");
    const [editingstate, setEditingState] =useState(false)
    const [sortField, setSortField] = useState<string>("name");
    const [ascending, setAscending] = useState<boolean>(true);
    const [salary, setSalary] = useState<number|null>(null);
    async function getJobApps(userId: (string | null)){
        try{
            const res = await fetch(`${API_URL}/api/jobapp/${userId}`);
            if (!res.ok){
                throw new Error("Failed to fetch job applications")
            }
            const data =await res.json();
            return data;
        } catch (err) {
            console.error("Error Fetching Job Apps:", err)
            throw err;
        }
    }
    async function handleChange(jobAppid:number, field: keyof JobApp , value:string | number) {
        if (!field) return;

        try{
            await fetch(
                `${API_URL}/api/jobapp/update/${jobAppid}/user/${userId}`,
                {
                    method:"PUT",
                    headers:{"Content-Type":"application/json"},
                    body: JSON.stringify({
                        [field]: value,
                    })
                }
            )
            setJobApps((prev) =>
                prev.map((app) =>
                    app.jobid === jobAppid
                    ? { ...app, [field]: value}
                    : app
                )
            );
            setEditingState(false);
            return;
        } catch (err){
            setErrorMessage("Error trying to update Field")
            return;
        }
    }
    async function sortJobApps(userId: string, sort:string, ascending: boolean){
        const order = ascending ? "ASC" : "DESC"
            try{
            const res = await fetch(
                `${API_URL}/api/jobapp/${userId}?sort=${sort}&order=${order}&page=1&limit=20`
            );
            if (!res.ok){
                throw new Error("Failed to Sort job applications")
            }
            const data =await res.json();
            setJobApps(data);
        } catch (err) {
            setErrorMessage("Error sorting Job Apps")
        }
    }
    
    function handleSortClick(field: string) {
        if(!userId) return;
        if (field === sortField) {
            // Same column → toggle direction
            const nextAscending = !ascending
            setAscending(nextAscending);
            sortJobApps(userId, field, nextAscending);
        } else {
            // New column → default ASC
            setSortField(field);
            setAscending(true);
            sortJobApps(userId, field, true);
        }
    }

    useEffect(()=>{
        if (!userId){
            setErrorMessage("No User Detected, Login Required")
            return;
        }
        if(editingstate === true){
            return
        }
        async function loadJobApps(){
            try{
                const apps = await getJobApps(userId);
                setJobApps(apps)
            }catch {
                console.error("Could not load job applications")
            }
        }
        loadJobApps();

    },[userId])

    useEffect(()=>{
    }, [jobapps])
    return(
    <Stack>
        <Container fluid   style={{ display:"flex", alignContent:"center", justifyContent:"center", padding:"15px"} }>
            <Table variant="dark" className="text-white mb-3" >
                <thead>
                    <tr>
                        <th onClick={() => handleSortClick("name")}>
                            Company Name {sortField === "name" && (ascending ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSortClick("position")}>
                            Position Title {sortField === "position" && (ascending ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSortClick("status")}>
                            Status {sortField === "status" && (ascending ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSortClick("link")}
                        >Link</th>
                        <th onClick={() => handleSortClick("platform")}>
                            Platform {sortField === "platform" && (ascending ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSortClick("date")}>
                            Date Applied {sortField === "date" && (ascending ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSortClick("salary")}>
                            Salary/hour {sortField === "salary" && (ascending ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSortClick("notes")}>
                            Notes {sortField === "notes" && (ascending ? "▲" : "▼")}
                        </th>
                        <th>Edit</th>
                    </tr>

                </thead>
                <tbody>
                    {jobapps.map( jobapps => 
                    <tr key={jobapps.jobid}>
                        <td>
                            {(editingId === jobapps.jobid && editingField ==="name") && editingstate===true ? (
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e)=>setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const field = editingField
                                            const value = editValue
                                            setEditingId(null);
                                            setEditingField(null);
                                            handleChange(jobapps.jobid,field,value);
                                        }
                                    }}
                                    autoFocus
                                />
                            ):
                            (jobapps.name)
                         }
                        </td>
                        <td>
                            {(editingId === jobapps.jobid && editingField ==="position") && editingstate===true ? (
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e)=>setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const field = editingField
                                            const value = editValue
                                            setEditingId(null);
                                            setEditingField(null);
                                            handleChange(jobapps.jobid,field,value);
                                        }
                                    }}
                                    autoFocus
                                />
                            ):
                            (jobapps.position)
                         }
                        </td>
                        <td>
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic">
                                    {jobapps.status}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                <Dropdown.Item
                                onClick={()=>{
                                    handleChange(jobapps.jobid,"status","Pending");
                                }}
                                >
                                    Pending
                                </Dropdown.Item>
                                <Dropdown.Item
                                onClick={()=>{
                                    handleChange(jobapps.jobid,"status","Accepted");
                                }}
                                >
                                    Accepted
                                </Dropdown.Item>
                                <Dropdown.Item
                                onClick={()=>{
                                    handleChange(jobapps.jobid,"status","Declined");
                                }}
                                >
                                    Declined
                                </Dropdown.Item>
                            </Dropdown.Menu>
                            </Dropdown>
                        </td>
                        <td>
                            {(editingId === jobapps.jobid && editingField ==="link") && editingstate===true ? (
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e)=>setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const field = editingField
                                            const value = editValue
                                            setEditingId(null);
                                            setEditingField(null);
                                            handleChange(jobapps.jobid,field,value);
                                        }
                                    }}
                                    autoFocus
                                />
                            ):
                            (
                                <a
                                    href={jobapps.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={jobapps.link}
                                >
                                    Job Link
                                </a>
                            )
                         }
                        </td>
                        <td>
                            {(editingId === jobapps.jobid && editingField ==="platform") && editingstate===true ? (
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e)=>setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const field = editingField
                                            const value = editValue
                                            setEditingId(null);
                                            setEditingField(null);
                                            handleChange(jobapps.jobid,field,value);
                                        }
                                    }}
                                    autoFocus
                                />
                            ):
                            (jobapps.platform)
                         }
                        </td>
                        <td>
                            {jobapps.month}/{jobapps.day}/{jobapps.year}
                        </td>
                        <td>
                            {(editingId === jobapps.jobid) && editingField==="salary" && editingstate===true ? (
                                <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e)=>setSalary(e.target.value ==="" ? null: Number(e.target.value))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            setEditingId(null);
                                            setEditingField(null);
                                            handleChange(jobapps.jobid,"salary", salary? salary : 0);
                                        }
                                    }}
                                    autoFocus
                                />
                            ):
                            (jobapps.salary)
                         }
                        </td>
                        <td>
                            {(editingId === jobapps.jobid) && editingField==="notes" && editingstate===true ? (
                                <Form>
                                    <Form.Control
                                    as="textarea"
                                    rows={3} 
                                    value={editValue}
                                    onChange={(e)=>setEditValue(e.target.value)}
                                    onKeyDown={(e) => { 
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const field = editingField
                                            const value = editValue
                                            setEditingId(null);
                                            setEditingField(null);
                                            handleChange(jobapps.jobid,field,value);
                                        }
                                    }}
                                    autoFocus
                                    />
                                </Form>
                            ):
                            (jobapps.notes)
                         }
                        </td>
                        <td style={{}}>
                            <Dropdown align="end" style={{ display:"flex", alignContent:"center", justifyContent:"center"}}>
                                <Dropdown.Toggle
                                variant="link"
                                className="p-0 text-white"
                                style={{textDecoration: "none" }}
                                >
                                    ⋮
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        onClick={()=>{
                                            setEditingId(jobapps.jobid)
                                            setEditingField("name")
                                            setEditValue(jobapps.name)
                                            setEditingState(true)
                                        }}
                                    >
                                        Company Name
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={()=>{
                                            setEditingId(jobapps.jobid)
                                            setEditingField("position")
                                            setEditValue(jobapps.position)
                                            setEditingState(true)
                                        }}
                                    >
                                        Position
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={()=>{
                                            setEditingId(jobapps.jobid)
                                            setEditingField("link")
                                            setEditValue(jobapps.link)
                                            setEditingState(true)
                                        }}
                                    >
                                        Link
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={()=>{
                                            setEditingId(jobapps.jobid)
                                            setEditingField("platform")
                                            setEditValue(jobapps.platform)
                                            setEditingState(true)
                                        }}
                                    >
                                        Platform
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={()=>{
                                            setEditingId(jobapps.jobid)
                                            setEditingField("salary")
                                            setEditValue(jobapps.salary ? jobapps.salary.toString() : "")
                                            setEditingState(true)
                                        }}
                                    >   Salary
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={()=>{
                                            setEditingId(jobapps.jobid)
                                            setEditingField("notes")
                                            setEditValue(jobapps.notes ? jobapps.notes : "")
                                            setEditingState(true)
                                        }}
                                    >
                                        Notes
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </td>
                    </tr>
                    )}
                </tbody>
            </Table>
            
        </Container>
        {/*User Error Message*/}
            {errormessage.length > 0 && 
            <Container
                fluid
                className="position-fixed bottom-0 start-50 translate-middle-x mb-3"
                style={{ zIndex: 1050 }}
            >
                <Card>
                    <Card.Header>
                        Error
                    </Card.Header>
                    <Card.Body>
                        {errormessage}
                    </Card.Body>
                </Card>
            </Container>
            }
    </Stack>
    )
}
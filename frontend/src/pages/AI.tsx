import { Stack, Container, Card, Form, Row, Col, Button} from "react-bootstrap"
import {useState } from "react"
import { useUser } from "../PageContext"
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
interface AIProps {
  setPage: (page: string) => void;
}
export default function AIPage({setPage}: AIProps){
    const {userId} = useUser();
    const [jobapp, setJobApp] = useState<JobApp>()
    const [month,setMonth] = useState<number|null>(null)
    const [day,setDay] = useState<number|null>(null)
    const [year,setYear] = useState<number|null>(2025)
    const isLoggedIn = Boolean(userId && userId.length > 0)
    const [jobDescription, setJobDescription] = useState("")
    const [jobLink, setJobLink] = useState("")
    async function handleJobApplication(
        month: number|null,
        day: number|null,
        year: number|null,
    ) 
    {
        if (!jobapp?.status)
            console.log("No Status Selected")
        try{
            const res = await fetch(`${API_URL}/api/jobapp/create/user/${userId}`,
                {
                    method: "POST",
                    headers:{"Content-Type": "application/json"},
                    body: JSON.stringify({
                        name: jobapp?.name,
                        position: jobapp?.position,
                        status: jobapp?.status,
                        link: jobapp?.link,
                        platform: jobapp?.platform,
                        salary: jobapp?.salary,
                        notes: jobapp?.notes,
                        month,
                        day,
                        year,
                    })
                }
            )

            if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Error setting up Job Application");
            }
            setPage("Home");
        } catch (err){
            console.log("Error setting up Job Application")
            return;
        }
    }

    async function AIassist(jobDescription:string, jobLink:string): Promise<JobApp> {

            const res = await fetch (
                `${API_URL}/api/ai/autocomplete`, {
                    method:"POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        prompt: jobDescription,
                        link: jobLink,
                    })
                }
            )
            if (!res.ok) {
                const err = await res.json();
                console.error(err.error || "AI parsing Failed")
            }
            const data = await res.json();
            setJobApp(data);
            return data;
    }
    return(
        <Stack>
            {isLoggedIn ? (
                <Container>
                    {!jobapp ? (
                        <Form className="text-white">
                            <Form.Group>
                                <Form.Label>Link</Form.Label>
                                <Form.Control onChange={(e)=> setJobLink(e.target.value)}></Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Job Description:</Form.Label>
                                <Form.Control as="textarea" rows={10}
                                onChange={(e)=> setJobDescription(e.target.value)}
                                ></Form.Control>
                            </Form.Group>
                            <Button variant="secondary" onClick={()=> AIassist(jobDescription, jobLink)}>Submit</Button>
                        </Form>
                    ):
                    <Card bg="dark" className="text-white" style={{padding:"15px"}}>
                    <Form>
                        <Form.Group>
                            <Form.Label>Company Name</Form.Label>
                            <Form.Control 
                            placeholder="Enter Company Name"
                            value={jobapp?.name ?? ""}   // ✅ controlled
                            onChange={(e) =>
                            setJobApp({
                                ...jobapp!,
                                name: e.target.value
                            })
                            }
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Position</Form.Label>
                            <Form.Control 
                            placeholder="Enter Position Name"
                            defaultValue={jobapp?.position}
                            onChange={(e)=> {setJobApp({...jobapp, position: e.target.value})}}
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select value={jobapp.status} onChange={(e)=> setJobApp({...jobapp, status: e.target.value})}>
                            <option value="">Select Status Option</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Declined">Declined</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                            <Form.Label>Link</Form.Label>
                            <Form.Control 
                            placeholder="Enter Link"
                            defaultValue={jobapp?.link}
                            onChange={(e)=> {setJobApp({...jobapp, link: e.target.value})}}
                            ></Form.Control>
                        </Form.Group>
                    <Form.Group>
                        <Form.Label>Platform</Form.Label>
                        <Form.Control 
                        placeholder="Enter Platform: LinkedIn, Indeed, Glassdoor"
                        defaultValue={jobapp?.platform}
                        onChange={(e)=> {setJobApp({...jobapp, platform: e.target.value})}}
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Date Applied</Form.Label>
                        <Row>
                            <Col>
                                <Form.Control 
                                type="number" placeholder="Month" min={1} max={12} step={1}
                                onChange={(e)=>setMonth(e.target.value ==="" ? null: Number(e.target.value))}
                                >
                                </Form.Control>
                            </Col>
                            <Col>
                                <Form.Control
                                 type="number" placeholder="Day" min={1} max={30} step={1}
                                 onChange={(e)=>setDay(e.target.value ==="" ? null: Number(e.target.value))}
                                 >
                                 </Form.Control>
                            </Col>
                            <Col xs={8}>
                                <Form.Control 
                                type="number" placeholder="Year" step={1} defaultValue={2025}
                                onChange={(e)=>setYear(e.target.value ==="" ? null: Number(e.target.value))}
                                >
                                </Form.Control>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Salary per hour (Optional)</Form.Label>
                        <Form.Control type="number" placeholder="Enter Salary"  
                        value={jobapp.salary ?? ""}   // ✅ controlled
                        onChange={(e) =>
                            setJobApp({
                                ...jobapp!,
                                salary: e.target.value === "" ? null : Number(e.target.value)
                            })
                        }   ></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Notes (Optional)</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Enter Notes"
                        value={jobapp.notes ?? ""}   // ✅ controlled
                        onChange={(e) =>
                            setJobApp({
                                ...jobapp!,
                                notes: e.target.value === "" ? null : e.target.value
                            })
                        }
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Button variant="primary" onClick={()=> handleJobApplication(month, day, year)}>Submit</Button>
                    </Form.Group>
                    </Form>
                    </Card>
                    }
                </Container>
            ):
            <Container className="mt-3">
                <Card bg="danger" text-white>
                    <Card.Header>Error</Card.Header>
                    <Card.Body>
                        <Card.Text> No User Detected. Please Login</Card.Text>
                    </Card.Body>
                </Card>
            </Container>
            }
        </Stack>
    )
}
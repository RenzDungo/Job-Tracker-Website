import { useState, useEffect } from "react";
import{ Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useUser } from '../PageContext';
const API_URL = import.meta.env.VITE_API_URL;
interface AddPageProps{
    setPage: (page: string)=> void;
}
export default function AddPage({setPage}: AddPageProps){
    const {userId} =useUser();
    const [companyname, setCompanyName] =useState("");
    const [positiontitle, setPositionTitle] =useState("");
    const [status,setStatus] =useState("");
    const [joblink, setJobLink] =useState("");
    const [platform,setPlatform] =useState("");
    const [salary,setSalary] = useState<number|null>(null)
    const [notes,setNotes] = useState<string|null>(null)
    const [month,setMonth] = useState<number|null>(null)
    const [day,setDay] = useState<number|null>(null)
    const [year,setYear] = useState<number|null>(2025)
    const [errormessage, setErrorMessage] = useState("")
    async function handleJobApplication(
        name: string,
        position: string,
        status: string,
        link: string,
        platform: string,
        salary: number|null,
        notes: string|null,
        month: number|null,
        day: number|null,
        year: number|null,
    ) {
        if (!status){
            setErrorMessage("Please Select a Status")
        }
        try{
            const res = await fetch(`${API_URL}/api/jobapp/create/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    position,
                    status,
                    link,
                    platform,
                    salary,
                    notes,
                    month,
                    day,
                    year,
                }),
            })
            if (!res.ok){
                const err = await res.json();
                setErrorMessage(err.err|| "Failed to create Job Application")
            }
            setPage("Home");
        } catch (err) {
            setErrorMessage("Error setting up Job Application")
            return;
        }
    }
    useEffect(()=>{
        if (!userId){
            setErrorMessage("No User, Please Login")
        }
    },[userId])
    return(
        <Container>
            <Card bg="dark" className="text-white" style={{padding:"25px"}}>
                <Form>
                    <Form.Group className="mb-3"> 
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control placeholder="Enter Company Name" onChange={(e)=> setCompanyName(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Position Title</Form.Label>
                        <Form.Control placeholder="Enter Position Title" onChange={(e)=> setPositionTitle(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select value={status} onChange={(e)=> setStatus(e.target.value)}>
                            <option value="">Select Status Option</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Declined">Declined</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Job Link</Form.Label>
                        <Form.Control placeholder="Enter Job Link" onChange={(e)=> setJobLink(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Platform</Form.Label>
                        <Form.Control placeholder="Enter Platform Site LinkedIn/Indeed/Glassdoor" onChange={(e)=> setPlatform(e.target.value)}></Form.Control>
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
                        <Form.Control type="number" placeholder="Enter Salary" onChange={(e)=>setSalary(e.target.value ==="" ? null: Number(e.target.value))}></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Notes (Optional)</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Enter Notes" onChange={(e)=>setNotes(e.target.value ==="" ? null: e.target.value)}></Form.Control>
                    </Form.Group>
                </Form>
                <Form.Group>
                    <Button variant="secondary" disabled={!userId} onClick={()=> handleJobApplication(companyname, positiontitle, status, joblink, platform, salary, notes, month, day, year)}>
                        Add Entry
                    </Button>
                </Form.Group>
            </Card>
            {errormessage.length > 0 && 
            <Card>
                <Card.Header>
                    Error
                </Card.Header>
                <Card.Body>
                    <Card.Text>
                        {errormessage}
                    </Card.Text>
                </Card.Body>
            </Card>
            }
        </Container>
    )
}
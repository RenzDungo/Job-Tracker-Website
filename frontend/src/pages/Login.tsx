import {Card, Container, Stack, Button, Form} from 'react-bootstrap'
import { useUser } from '../PageContext';
import { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
interface LoginPageProps {
    setPage: (page: string) => void;
}
export default function LoginPage({setPage}: LoginPageProps){
    const {setUserId} = useUser();
    const [useremail,setUserEmail] = useState("")
    const [userpassword, setUserPassword] =useState("")
    const [registered, setRegistered] =useState(false)
    const [errormessage,setErrorMessage] =useState("")
     async function handleUserLogin(email: string, password:string){
        try{ 
            const res = await fetch(`${API_URL}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMessage("Wrong Username or Password");
                return;
            }

            setUserId(data.id)
            setPage("Home");
        } catch(err) {return}
    }

     async function handleUserRegister(email: string, password: string) {
        try{
            const res = await
            fetch(`${API_URL}/api/users/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                // API returned an error (400, 409, 500, etc.)
                setErrorMessage(data.error || "Failed to create account");
                return false;
            }
            return true;
        } catch(err) {
            setErrorMessage("Unable to connect to server. Please try again.");
            return
        }
    }
    return(
        <Container>
            {registered === false && 
                <Stack gap={3}>
                    <Card bg='dark' className='text-white' style={{}}>
                        <Form 
                        onSubmit={(e) => {
                            e.preventDefault(); // 🚨 stops page reload
                            handleUserLogin(useremail, userpassword);
                        }}
                        style={{padding:"10px"}}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control 
                                type="email" 
                                placeholder="Enter email"
                                value={useremail}
                                onChange={(e)=> setUserEmail(e.target.value)}
                                />
                                <Form.Text className="text-white">
                                We'll never share your email with anyone else.
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" 
                                placeholder="Password" 
                                onChange={(e)=>setUserPassword(e.target.value)}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Login
                            </Button>
                            <Form.Group>
                            <Form.Text className="text-white">
                                If no Account Register Here:
                            </Form.Text>
                            <br/>
                            <Button variant='secondary' 
                            onClick={()=> setRegistered(true)}
                            >
                                Register
                            </Button>
                            </Form.Group>
                        </Form>
                    </Card>
                </Stack>
            }
            {registered === true && 
                <Card bg='dark' className='text-white'>
                    <Form style={{padding:"10px"}}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control 
                                type="email" 
                                placeholder="Enter email"
                                value={useremail}
                                onChange={(e)=> setUserEmail(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" 
                                placeholder="Password" 
                                onChange={(e)=>setUserPassword(e.target.value)}
                                />
                            </Form.Group>
                            <Button variant="primary" 
                            onClick={
                                async () => {
                                    const success = await handleUserRegister(useremail, userpassword);
                                    if (success) setRegistered(false);
                            }}
                            >
                                Register
                            </Button>
                        </Form>
            </Card>
            }
            {
                errormessage.length > 0 &&
                <Card bg='dark' className='text-white'>
                    <Card.Header>Error ❌</Card.Header>
                    <Card.Body>
                        <Card.Text> {errormessage} </Card.Text>
                    </Card.Body>
                </Card>
            }
        </Container>
    )
}
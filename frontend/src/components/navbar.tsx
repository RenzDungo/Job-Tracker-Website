import { Navbar, Container, Nav, Button } from "react-bootstrap";
interface NavbarProps{
page: string;
setPage: (page:string)=> void;
}
export default function NavbarComponent({setPage}: NavbarProps){
    return(
        <Navbar expand="lg" variant="dark" sticky="top" bg="dark">
        <Container>
          <Navbar.Brand>JobApp Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav"/>
          <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link onClick={()=> setPage("Home")}>Home</Nav.Link>
            <Nav.Link onClick={()=> setPage("Add")}>Add</Nav.Link>
            <Nav.Link onClick={()=> setPage("AI")}>Automated Add</Nav.Link>
          </Nav>
          <Button onClick={()=>setPage("Login")} className="ms-auto">Login</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
}
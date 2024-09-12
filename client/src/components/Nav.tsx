import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Nav() {
  return (
    <nav className="fixed top-0 flex border-b w-full justify-between px-[10%] items-center py-2 backdrop-blur-sm">
      <Link to='/'>Chat App</Link>
      <Link to={'/login'}>
      <Button variant='outline'>Login</Button>
      </Link>
    </nav>
  )
}

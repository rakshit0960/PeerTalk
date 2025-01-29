import Nav from "@/components/Nav";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="px-[10%] relative min-h-[100dvh] pt-20 grid place-content-center bg-grainy">
      <Nav />
      <Outlet />
    </div>
  )
}

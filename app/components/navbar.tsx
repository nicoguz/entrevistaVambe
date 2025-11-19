'use client'
import { useRouter } from "next/navigation";
import { NavButton } from "./NavButton";

export default function NavBar() {
    const router = useRouter();
    return (
        <nav className="app-nav">
        <button
          onClick={() => router.push("/")}
          className="app-nav-btn app-nav-btn--ghost"
        >
          Home
        </button>

        <button
          onClick={() => router.push("/upload")}
          className="app-nav-btn app-nav-btn--secondary"
        >
          Subir CSV
        </button>

        <NavButton href="/dashboard" className="app-nav-btn app-nav-btn--primary">
          Dashboard
        </NavButton>
      </nav>
    )
}
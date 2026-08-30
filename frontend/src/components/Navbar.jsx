import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, Heart, User, LogOut, X, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const admin = String(user?.role || "").toLowerCase() === "admin";

  const logout = () => { signOut(); navigate("/"); };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">V</span>
          <span className="text-xl">Vanshi<span className="text-brand-600">Cart</span></span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/products" className="text-sm font-semibold text-slate-600 hover:text-brand-600">Products</NavLink>
          <NavLink to="/categories" className="text-sm font-semibold text-slate-600 hover:text-brand-600">Categories</NavLink>
        </nav>
        <div className="hidden flex-1 justify-center md:flex">
          <Link to="/products" className="flex w-full max-w-md items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
            <Search size={17}/> Search groceries...
          </Link>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {user ? <>
            <Link className="rounded-xl p-2 hover:bg-slate-100" to="/wishlist"><Heart size={19}/></Link>
            <Link className="rounded-xl p-2 hover:bg-slate-100" to="/cart"><ShoppingCart size={19}/></Link>
            {admin && <Link className="rounded-xl p-2 text-brand-700 hover:bg-brand-50" to="/admin"><Shield size={19}/></Link>}
            <Link className="rounded-xl p-2 hover:bg-slate-100" to="/profile"><User size={19}/></Link>
            <button onClick={logout} className="rounded-xl p-2 hover:bg-slate-100"><LogOut size={19}/></button>
          </> : <>
            <Link className="btn-secondary text-sm" to="/login">Login</Link>
            <Link className="btn-primary text-sm" to="/register">Register</Link>
          </>}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <div className="border-t border-slate-200 bg-white p-4 md:hidden">
        <div className="container-page flex flex-col gap-3">
          <Link to="/products" onClick={()=>setOpen(false)}>Products</Link>
          <Link to="/categories" onClick={()=>setOpen(false)}>Categories</Link>
          {user ? <>
            <Link to="/cart" onClick={()=>setOpen(false)}>Cart</Link>
            <Link to="/wishlist" onClick={()=>setOpen(false)}>Wishlist</Link>
            <Link to="/orders" onClick={()=>setOpen(false)}>Orders</Link>
            <Link to="/profile" onClick={()=>setOpen(false)}>Profile</Link>
            {admin && <Link to="/admin" onClick={()=>setOpen(false)}>Admin</Link>}
            <button className="text-left text-red-600" onClick={logout}>Logout</button>
          </> : <><Link to="/login" onClick={()=>setOpen(false)}>Login</Link><Link to="/register" onClick={()=>setOpen(false)}>Register</Link></>}
        </div>
      </div>}
    </header>
  );
}
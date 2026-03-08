import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Menu" },
    { to: "/offers", label: "Offers" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-primary">
      <div className="flex items-center justify-between h-14 px-3 md:px-6">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-1.5 text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-secondary-foreground font-bold text-sm">FC</span>
            </div>
            <span className="font-display text-lg text-primary-foreground font-bold">Friends Cafe</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                isActive(l.to) ? "bg-primary-foreground/20 text-primary-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Link to="/cart" className="relative p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-lg">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/dashboard" className="hidden md:flex p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-lg">
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link to="/login" className="hidden md:block">
              <span className="bg-secondary text-secondary-foreground text-sm font-bold px-3 py-1.5 rounded-md">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10 px-3 pb-3 space-y-0.5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 px-3 rounded-lg text-sm font-semibold ${
                isActive(l.to) ? "bg-primary-foreground/20 text-primary-foreground" : "text-primary-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-primary-foreground/70">
                Dashboard
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-primary-foreground/50">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm font-bold bg-secondary text-secondary-foreground text-center mt-2">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

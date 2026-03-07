import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee } from "lucide-react";

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      if (signup(name, email, password)) navigate("/");
    } else {
      if (login(email, password)) navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold">Friends Cafe</span>
          </Link>
          <h1 className="font-display text-3xl font-bold">{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-muted-foreground mt-1">{isSignup ? "Join us and start earning rewards" : "Login to your account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-6 space-y-4">
          {isSignup && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" size="lg">
            {isSignup ? "Sign Up" : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

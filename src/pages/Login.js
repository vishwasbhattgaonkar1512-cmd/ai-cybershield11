import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(email, password);
      alert("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <h2>🔐 Login</h2>

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <p>
        Don't have account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}

export default Login;
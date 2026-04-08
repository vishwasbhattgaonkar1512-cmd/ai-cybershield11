import { useState } from "react";
import { signup } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await signup(email, password);
      alert("Account Created!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <h2>📝 Signup</h2>

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

      <button onClick={handleSignup}>Signup</button>

      <p>
        Already have account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
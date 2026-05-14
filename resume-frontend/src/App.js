import React, { useState } from "react";
import Dashboard from "./Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // LOGIN FUNCTION
  const handleLogin = (e) => {

    e.preventDefault();

    // DEFAULT LOGIN
    if (
      username === "admin" &&
      password === "admin123"
    ) {

      setIsLoggedIn(true);

    } else {

      alert("Invalid Username or Password");
    }
  };

  // LOGOUT
  const handleLogout = () => {

    setIsLoggedIn(false);

    setUsername("");
    setPassword("");
  };

  // SHOW DASHBOARD AFTER LOGIN
  if (isLoggedIn) {

    return (
      <Dashboard handleLogout={handleLogout} />
    );
  }

  // LOGIN PAGE
  return (

    <div className="container mt-5">

      <div className="row justify-content-center">

        <div className="col-md-4">

          <div className="card shadow p-4">

            <h2 className="text-center mb-4 text-primary">
              Admin Login
            </h2>

            <form onSubmit={handleLogin}>

              <div className="mb-3">

                <label>Username</label>

                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                />

              </div>

              <div className="mb-3">

                <label>Password</label>

                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Login
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
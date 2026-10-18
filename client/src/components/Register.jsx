import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

const Register = ({ setIsLoginBox }) => {
  const { setUsername, setEmail, setPassword, setUsertype, register } = useContext(GeneralContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    await register();
  };

  return (
    <form className="authForm" onSubmit={handleRegister}>
      <h2>Register</h2>
      <div className="form-floating mb-3 authFormInputs">
        <input
          type="text"
          className="form-control"
          id="floatingUsername"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="floatingUsername">Username</label>
      </div>
      <div className="form-floating mb-3 authFormInputs">
        <input
          type="email"
          className="form-control"
          id="floatingEmail"
          placeholder="name@example.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingEmail">Email address</label>
      </div>
      <div className="form-floating mb-3 authFormInputs">
        <input
          type="password"
          className="form-control"
          id="floatingPassword"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>
      <div className="mb-3 authFormInputs">
        <select
          className="form-select form-select-lg"
          aria-label=".form-select-lg example"
          onChange={(e) => setUsertype(e.target.value)}
          required
          defaultValue=""
        >
          <option value="" disabled>User type</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary w-100 py-2">
        Register
      </button>

      <p>
        Already registered? <span onClick={() => setIsLoginBox(true)}>Sign In</span>
      </p>
    </form>
  );
};

export default Register;

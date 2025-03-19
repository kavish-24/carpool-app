import React from 'react';
import RegisterForm from '../components/RegisterForm';

const Register = ({ onLogin }) => {
  return (
    <div>
      <h2>Register</h2>
      <RegisterForm onLogin={onLogin} />
    </div>
  );
};

export default Register;
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.isLoggedIn) {
      // If logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // Otherwise redirect to login
      navigate('/login');
    }
  }, [navigate]);

  // This is just a fallback in case the redirect doesn't happen immediately
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Allergen Detection System</h1>
        <p className="text-xl text-gray-600">Redirecting you to the login page...</p>
      </div>
    </div>
  );
};

export default Index;


import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Account Access</h1>
      <AuthForm />
    </div>
  );
}

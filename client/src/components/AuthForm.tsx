import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Mail, Lock, User } from "lucide-react";

interface AuthFormProps {
  onAuth: (user: { id: number; firstName: string; lastName: string; email: string }) => void;
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signin");

  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signInData),
      });

      const data = await response.json();

      if (response.ok) {
        onAuth(data.user);
      } else {
        setError(data.message || "Sign in failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (response.ok) {
        onAuth(data.user);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-white">Welcome</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-700">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mb-4 border-red-600 bg-red-900/20">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname" className="text-white">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="First name"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname" className="text-white">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Last name"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Production-ready authentication system
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
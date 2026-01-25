'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Cake, Loader2 } from 'lucide-react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@whiskedelights.com');
  const [password, setPassword] = useState('admin');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isAdminLoggedIn) {
      router.replace('/admin/dashboard');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Mock login logic
    if (email === 'admin@whiskedelights.com' && password === 'admin') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      toast({
        title: 'Login Successful',
        description: 'Welcome back, Admin!',
      });
      router.push('/admin/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
      setIsLoggingIn(false);
    }

    /* Real API Login Logic
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password.');
      }

      const { token, admin } = await response.json();

      // Store token and user data for authenticated requests
      localStorage.setItem('authToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      localStorage.setItem('isAdminLoggedIn', 'true'); // Keep this for the client-side auth check

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${admin.name}!`,
      });
      
      router.push('/admin/dashboard');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unknown error occurred.',
      });
      setIsLoggingIn(false);
    }
    */
  };

  if (isCheckingAuth) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
             <div className="flex items-center gap-2 justify-center font-bold text-lg text-primary mb-4">
                <Cake className="h-6 w-6" />
                <span>WhiskeDelights</span>
             </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@whiskedelights.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoggingIn}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? <><Loader2 className="animate-spin mr-2" /> Logging in...</> : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

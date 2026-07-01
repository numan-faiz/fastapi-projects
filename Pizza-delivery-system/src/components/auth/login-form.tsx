'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Loader2, LogIn, Pizza } from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTokens, setName, setUsername: setUsernameStore, setIsStaff, setView } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const tokens = await api.login({ username: cleanUsername, password: cleanPassword });
      setTokens(tokens);
      setUsernameStore(tokens.username || cleanUsername);
      if (tokens.name) setName(tokens.name);
      // Check if user is admin by probing the admin-only endpoint
      const staff = await api.checkIsStaff(tokens.access);
      setIsStaff(staff);
      setView(staff ? 'admin' : 'dashboard');
      const displayName = tokens.name || tokens.username || cleanUsername;
      toast({ title: staff ? 'Welcome back, Admin!' : 'Welcome back!', description: `Logged in as ${displayName}` });
    } catch (err) {
      toast({
        title: 'Login Failed',
        description: err instanceof Error ? err.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-3 pb-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <Pizza className="w-9 h-9 text-orange-600" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
        <CardDescription>Sign in to your pizza delivery account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-orange-600 font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

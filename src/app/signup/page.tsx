"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Loader2, Mail } from 'lucide-react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            username,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <Mail className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Check your email</CardTitle>
            <CardDescription className="text-zinc-400">
              We&apos;ve sent you a confirmation link to <strong className="text-white">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Click the link in the email to verify your account and start building APIs.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
              <Image
                className='relative object-contain'
                width={150}
                height={150}
                src="/logo.png" 
                alt="Synthetix Logo" 
                />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Create an account
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="jdoe"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/40 border-zinc-800 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border-zinc-800 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/40 border-zinc-800 focus-visible:ring-indigo-500"
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-md border border-red-500/20">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Create account'
              )}
            </Button>
            <div className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

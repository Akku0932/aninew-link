import LoginForm from "@/components/auth/login-form"
import Logo from "@/components/logo"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | ANINEW",
  description: "Login to your ANINEW account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <Logo size="lg" animated={true} />
      </div>
      <LoginForm />
    </div>
  )
} 
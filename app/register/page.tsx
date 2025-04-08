import RegisterForm from "@/components/auth/register-form"
import Logo from "@/components/logo"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register | ANINEW",
  description: "Create your ANINEW account",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <Logo size="lg" animated={true} />
      </div>
      <RegisterForm />
    </div>
  )
} 
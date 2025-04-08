import { Metadata } from "next"
import RegisterForm from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register | AniNew",
  description: "Create a new account on AniNew",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  )
} 
// Feature: link2skill-platform
// Task 2.1 (UI): Registration page
// Requirements: 1.1, 1.2, 1.8, 1.9

import AuthLayout from "@/app/components/AuthLayout";
import RegisterForm from "@/app/register/RegisterForm";

export const metadata = {
  title: "Create your account — Link2Skill",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Link2Skill to start learning or teaching"
    >
      <RegisterForm />
    </AuthLayout>
  );
}

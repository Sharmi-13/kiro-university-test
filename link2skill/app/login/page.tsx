// Feature: link2skill-platform
// Task 2.4 (UI): Login page
// Requirements: 1.3, 1.4

import AuthLayout from "@/app/components/AuthLayout";
import LoginForm from "@/app/login/LoginForm";

export const metadata = {
  title: "Log in — Link2Skill",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue learning or teaching"
    >
      <LoginForm />
    </AuthLayout>
  );
}

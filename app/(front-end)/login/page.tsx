import LoginForm from "@/components/frontend/LoginForm";

export default function Login() {
  return (
    <section className="bg-gray-50 min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-gray-900 text-center mb-6">
          Login to Account
        </h1>
        <LoginForm />
      </div>
    </section>
  );
}
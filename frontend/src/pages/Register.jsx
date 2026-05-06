import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/common/FormElements';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Coffee,
  PenLine,
  Stars,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    try {
      await register(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      // Handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7ef] text-slate-900">
      {/* Soft paper background */}
      <div className="absolute inset-0 bg-[linear-gradient(#eadfce_1px,transparent_1px),linear-gradient(90deg,#eadfce_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
      <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-slate-300/40 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />

      {/* Floating items */}
      <div className="absolute left-[8%] top-[18%] hidden rotate-[-12deg] rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5 md:block">
        <BookOpen className="h-7 w-7 text-slate-600" />
        <p className="mt-3 text-sm font-bold">Chapter 04</p>
        <p className="text-xs text-slate-400">Biology notes</p>
      </div>

      <div className="absolute right-[10%] top-[16%] hidden rotate-[10deg] rounded-full bg-white px-5 py-3 shadow-xl ring-1 ring-black/5 md:flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-bold">25 min focus</span>
      </div>

      <div className="absolute bottom-[18%] left-[12%] hidden rotate-[8deg] rounded-3xl bg-slate-100 p-5 shadow-xl md:block">
        <PenLine className="h-6 w-6 text-slate-700" />
        <p className="mt-3 max-w-[130px] text-sm font-bold">
          Review math formulas
        </p>
      </div>

      <div className="absolute bottom-[16%] right-[12%] hidden rotate-[-8deg] rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5 md:block">
        <Coffee className="h-6 w-6 text-slate-500" />
        <p className="mt-3 text-sm font-bold">Break time</p>
        <p className="text-xs text-slate-400">After 2 tasks</p>
      </div>

      {/* Main card */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-slate-900 shadow-xl shadow-slate-300">
              <Stars className="h-7 w-7 text-slate-100" />
            </div>

            <h1 className="text-4xl font-black tracking-tight">
              StudyFlow
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Create your workspace and start organizing.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white/85 p-7 shadow-2xl shadow-slate-300/50 ring-1 ring-black/5 backdrop-blur-xl">
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
                Register
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Start your journey.
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="group w-full bg-slate-900 hover:bg-slate-800"
                isLoading={isLoading}
              >
                <span className="flex items-center justify-center gap-2">
                  Create workspace
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                onClick={() => setError(null)}
                className="font-black text-slate-900 hover:text-slate-600"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;

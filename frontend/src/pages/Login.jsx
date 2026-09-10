import { useState } from "react";
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

import { api } from "../services/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password
        })
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "staff",
        JSON.stringify(data.staff)
      );

      onLogin(data.staff);

    } catch (error) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="flex min-h-screen">

        {/* LEFT SIDE */}
        <div className="hidden w-1/2 flex-col justify-between bg-indigo-600 p-12 text-white lg:flex">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <GraduationCap size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  TuitionHub
                </h1>

                <p className="text-sm text-indigo-200">
                  Student Management System
                </p>
              </div>

            </div>

          </div>

          <div className="max-w-lg">

            <h2 className="text-5xl font-bold leading-tight">
              Manage your tuition center
              <span className="text-indigo-200">
                {" "}smarter.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Manage students, track fees, record payments,
              and keep your tuition center organized from one
              simple dashboard.
            </p>

          </div>

          <p className="text-sm text-indigo-200">
            © {new Date().getFullYear()} TuitionHub
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <div className="mb-10 flex justify-center lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    TuitionHub
                  </h1>

                  <p className="text-xs text-slate-400">
                    Student Management
                  </p>
                </div>

              </div>

            </div>

            {/* LOGIN CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">

              <div className="mb-8">

                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access your dashboard.
                </p>

              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* USERNAME */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Username
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      placeholder="Enter username"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />

                  </div>

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}

                </button>

              </form>

            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure staff access • TuitionHub
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
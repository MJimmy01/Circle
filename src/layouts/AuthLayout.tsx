import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-4">
      <div className="w-full max-w-lg rounded-3xl p-8 backdrop-blur-xl bg-white/90 shadow-2xl border border-white/40 transition-all">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-extrabold tracking-wider text-sm shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            CIRCLE
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

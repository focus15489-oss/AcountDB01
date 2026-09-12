import React, { useState } from 'react';
import { Wallet, LogIn, LogOut, Database, UserCheck, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signInAsGuest, logOut, TARGET_PROJECT_DISPLAY_NAME } from '../lib/firebase.ts';

interface NavbarProps {
  user: User | null;
  loadingAuth: boolean;
  onOpenFirebaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, loadingAuth, onOpenFirebaseConfig }) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInAsGuest('ผู้ใช้ทดลอง (Demo User)');
    } catch (err: any) {
      console.error('Guest login error:', err);
      setAuthError(err.message || 'ไม่สามารถเข้าสู่ระบบทดลองได้');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  ระบบจัดการรายรับรายจ่าย
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ออนไลน์
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                บันทึก สรุปผลรายเดือน และวิเคราะห์ข้อมูลการเงิน
              </p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Firebase Project Indicator */}
            <button
              id="btn-firebase-badge"
              onClick={onOpenFirebaseConfig}
              title="ดูการตั้งค่า Firebase Project"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline text-slate-500">Project:</span>
              <span className="font-semibold text-slate-800">{TARGET_PROJECT_DISPLAY_NAME}</span>
            </button>

            {/* Auth Controls */}
            {loadingAuth ? (
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-emerald-500 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                      {user.displayName || 'ผู้ใช้งาน'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {user.email || 'บัญชีทดลอง'}
                    </p>
                  </div>
                </div>

                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-login-guest"
                  onClick={handleGuestLogin}
                  disabled={isSigningIn}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  ทดลองใช้
                </button>

                <button
                  id="btn-login-google"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all hover:border-slate-400"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-medium">เข้าสู่ระบบด้วย Gmail</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {authError && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{authError}</span>
            <button
              onClick={handleGuestLogin}
              className="ml-auto underline font-medium text-amber-900 hover:text-amber-950"
            >
              เข้าสู่ระบบทดลองแบบด่วน (Guest) แทน
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

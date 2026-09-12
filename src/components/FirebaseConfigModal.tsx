import React, { useState } from 'react';
import { Database, X, CheckCircle2, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveCustomFirebaseConfig,
  resetToDefaultFirebaseConfig,
  TARGET_PROJECT_DISPLAY_NAME,
  FirebaseConfigType,
} from '../lib/firebase.ts';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getStoredFirebaseConfig();
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [firestoreDatabaseId, setFirestoreDatabaseId] = useState(
    currentConfig.firestoreDatabaseId || '(default)'
  );
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: FirebaseConfigType = {
      projectId: projectId.trim(),
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      appId: appId.trim(),
      firestoreDatabaseId: firestoreDatabaseId.trim() || '(default)',
    };
    saveCustomFirebaseConfig(newConfig);
    setIsSaved(true);
  };

  const handleReset = () => {
    resetToDefaultFirebaseConfig();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">การเชื่อมต่อ Firebase</h3>
              <p className="text-xs text-slate-500">เป้าหมายโปรเจกต์: <span className="font-medium text-amber-600">{TARGET_PROJECT_DISPLAY_NAME}</span></p>
            </div>
          </div>
          <button
            id="btn-close-firebase-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 leading-relaxed">
              <p className="font-medium mb-0.5">ระบบเชื่อมต่อฐานข้อมูล Cloud Firestore เรียบร้อยแล้ว</p>
              <p>โปรเจกต์พร้อมใช้งานสำหรับ <span className="font-semibold">{TARGET_PROJECT_DISPLAY_NAME}</span> รองรับระบบ Gmail Auth และการจัดเก็บข้อมูลแบบเรียลไทม์</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Firebase Project ID</label>
              <input
                id="input-firebase-project-id"
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">API Key</label>
              <input
                id="input-firebase-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Auth Domain</label>
                <input
                  id="input-firebase-auth-domain"
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Database ID</label>
                <input
                  id="input-firebase-db-id"
                  type="text"
                  value={firestoreDatabaseId}
                  onChange={(e) => setFirestoreDatabaseId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {isSaved && (
              <div className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" /> บันทึกการตั้งค่าแล้ว ระบบจะโหลดใหม่อัตโนมัติ
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                id="btn-reset-firebase-config"
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> คืนค่าเริ่มต้น
              </button>

              <div className="flex gap-2">
                <button
                  id="btn-cancel-firebase-config"
                  type="button"
                  onClick={onClose}
                  className="text-xs px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ปิด
                </button>
                <button
                  id="btn-save-firebase-config"
                  type="submit"
                  className="text-xs px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> บันทึกและเชื่อมต่อ
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

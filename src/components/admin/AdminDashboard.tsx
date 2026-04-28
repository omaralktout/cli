'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Settings,
  Clock,
  CalendarX,
  ImageIcon,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import AppointmentsPanel from './AppointmentsPanel';
import SettingsPanel from './SettingsPanel';
import WorkingHoursPanel from './WorkingHoursPanel';
import HolidaysPanel from './HolidaysPanel';
import GalleryPanel from './GalleryPanel';

const TABS = [
  { id: 'appointments', label: 'المواعيد', icon: CalendarDays, activeClass: 'bg-rose-50 text-rose-700 shadow-sm', iconActiveClass: 'text-rose-600' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, activeClass: 'bg-teal-50 text-teal-700 shadow-sm', iconActiveClass: 'text-teal-600' },
  { id: 'working-hours', label: 'ساعات العمل', icon: Clock, activeClass: 'bg-amber-50 text-amber-700 shadow-sm', iconActiveClass: 'text-amber-600' },
  { id: 'holidays', label: 'العطل', icon: CalendarX, activeClass: 'bg-red-50 text-red-700 shadow-sm', iconActiveClass: 'text-red-600' },
  { id: 'gallery', label: 'المعرض', icon: ImageIcon, activeClass: 'bg-violet-50 text-violet-700 shadow-sm', iconActiveClass: 'text-violet-600' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('appointments');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setAdminLoggedIn, setCurrentView } = useAppStore();

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setCurrentView('admin-login');
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'appointments':
        return <AppointmentsPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'working-hours':
        return <WorkingHoursPanel />;
      case 'holidays':
        return <HolidaysPanel />;
      case 'gallery':
        return <GalleryPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white border-l border-gray-200 shadow-lg lg:shadow-none transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">لوحة التحكم</h2>
                <p className="text-xs text-gray-400">إدارة العيادة</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? tab.activeClass
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? tab.iconActiveClass : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Button
              variant="outline"
              onClick={() => setCurrentView('patient')}
              className="w-full justify-start gap-2 text-gray-600 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              الموقع الرئيسي
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h1>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-2 h-2 bg-emerald-500 rounded-full ml-1.5 animate-pulse" />
            متصل
          </Badge>
        </header>

        {/* Panel Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderPanel()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

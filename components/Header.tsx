
import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Settings,
  Zap,
  ChevronDown,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  Check,
} from 'lucide-react';
import type { Lifecycle } from './BusinessReportPage';
import {
  NOTIFY_KIND_META,
  visibleNotifications,
  notifyTimeLabel,
  type NotifyItem,
  type NotifyKind,
} from './notificationData';

/** 类型 → 图标。配色走 NOTIFY_KIND_META，不在这里写死 */
const KIND_ICON: Record<NotifyKind, React.ComponentType<{ className?: string }>> = {
  'ai-report': Sparkles,
  lifecycle: CheckCircle2,
  expiry: Clock,
  report: FileText,
};

interface HeaderProps {
  /** 客户生命周期：决定消息中心里哪些消息存在 */
  lifecycle: Lifecycle;
  /** 点击消息跳转页面 */
  onNavigate?: (page: string) => void;
  /** 点击「仿真报告推送」直接打开弹窗 */
  onOpenSimReport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ lifecycle, onNavigate, onOpenSimReport }) => {
  const [time, setTime] = useState(new Date());
  const [currentSite, setCurrentSite] = useState('站点 #0241 (上海总部)');
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  /** 已读集合。会话内有效，刷新即回到默认未读态 */
  const [readIds, setReadIds] = useState<string[]>([]);
  const notifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* 点面板外或按 Esc 收起 */
  useEffect(() => {
    if (!isNotifyOpen) return;
    const onDown = (e: MouseEvent) => {
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) setIsNotifyOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNotifyOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isNotifyOpen]);

  const items = visibleNotifications(lifecycle);
  const isUnread = (n: NotifyItem) => !readIds.includes(n.id) && n.defaultUnread;
  const unreadCount = items.filter(isUnread).length;

  const handleItemClick = (n: NotifyItem) => {
    setReadIds(prev => (prev.includes(n.id) ? prev : [...prev, n.id]));
    setIsNotifyOpen(false);
    if (n.target === 'sim-report') onOpenSimReport?.();
    else if (n.target) onNavigate?.(n.target);
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-sm px-6 py-4 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-none">微网站点运行概览</h1>
          <p className="text-xs text-slate-500 mt-1">智慧能源监控系统 · 实时在线</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap justify-center gap-4">
        {/* 站点切换下拉框 */}
        <div className="relative group">
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="max-w-[150px] truncate">{currentSite}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform" />
          </button>
          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl p-2 hidden group-hover:block z-50">
            {['站点 #0241 (上海总部)', '站点 #0242 (杭州分部)', '站点 #0243 (苏州工厂)'].map((site) => (
              <button
                key={site}
                onClick={() => setCurrentSite(site)}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                {site}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* 消息通知：铃铛 + 下拉消息中心 */}
          <div className="relative" ref={notifyRef}>
            <button
              onClick={() => setIsNotifyOpen(v => !v)}
              aria-label="消息通知"
              className={`p-2 rounded-xl transition-colors text-slate-500 relative cursor-pointer ${
                isNotifyOpen ? 'bg-slate-100' : 'hover:bg-slate-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifyOpen && (
              <div className="absolute top-full right-0 mt-2 w-[380px] bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-[60]">
                {/* 面板头 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">消息通知</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-500 text-[10px] font-bold">
                        {unreadCount} 条未读
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setReadIds(items.map(n => n.id))}
                    disabled={unreadCount === 0}
                    className="text-[11px] font-medium text-slate-400 hover:text-emerald-600 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    全部已读
                  </button>
                </div>

                {/* 消息列表 */}
                <div className="max-h-[420px] overflow-y-auto">
                  {items.map(n => {
                    const meta = NOTIFY_KIND_META[n.kind];
                    const Icon = KIND_ICON[n.kind];
                    const unread = isUnread(n);
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleItemClick(n)}
                        className="w-full text-left px-4 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/80 transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs truncate ${
                                unread ? 'font-bold text-slate-800' : 'font-medium text-slate-500'
                              }`}
                            >
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {notifyTimeLabel(n.at)}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">{n.body}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                            {unread && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                      <Bell className="w-7 h-7 text-slate-400 mb-2" />
                      <span className="text-xs text-slate-500">暂无新消息</span>
                    </div>
                  )}
                </div>

                {/* 面板脚：把「消息」和「报警」两条线分开，避免被当成同一个东西 */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">消息保留 90 天</span>
                  <button
                    onClick={() => {
                      setIsNotifyOpen(false);
                      onNavigate?.('报警管理');
                    }}
                    className="text-[10px] font-medium text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    查看设备报警 &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

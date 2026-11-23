import React from 'react';
import { X, QrCode, CheckCircle2 } from 'lucide-react';

/* ==========================================================================
   开通 / 升级的扫码弹层
   --------------------------------------------------------------------------
   开通不再是系统内的「一键」动作：站点要由运营侧的开通权限来配，
   所以把原来的自我激活改成「扫码加零碳云管家，由顾问开通」。

   三种生命周期状态（未开通 / 试运行 / 正式运行）以及各处的状态条样式都保留，
   只是 CTA 点下去弹这个层，不再直接改状态。

   ⚠️ 二维码是占位素材（编码内容为「零碳云管家」四个字），
      拿到真实的加好友 / 小程序码后，直接替换 public/qr-lingtan.svg 即可，
      尺寸和留白已经按 1:1 画好，替换后不用改样式。
   ========================================================================== */

export type QrActivateMode = 'trial' | 'formal';

const COPY: Record<QrActivateMode, { title: string; tag: string; desc: string; note: string }> = {
  trial: {
    title: '开通 AI 智能调度',
    tag: '30 天试用',
    desc: '扫码添加专属顾问，核对站点信息后为你开通 30 天试用。',
    note: '开通完成后本页自动切换为「试运行」口径，试用期内可随时退出。',
  },
  formal: {
    title: '升级正式版',
    tag: 'AI 智能托管',
    desc: '扫码添加专属顾问，顾问确认试用期成绩后完成正式版升级。',
    note: '升级完成后本页切换为长期累积收益与模型迭代日志口径。',
  },
};

const STEPS = ['扫码添加顾问', '报站点名称 / 编号', '顾问完成开通'];

const ZeroCarbonQrModal: React.FC<{ mode: QrActivateMode | null; onClose: () => void }> = ({
  mode,
  onClose,
}) => {
  if (!mode) return null;
  const copy = COPY[mode];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A2A3A]/55 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl border border-[#DCE3EB] overflow-hidden">
        {/* 头：与报告弹窗同一套深色渐变 */}
        <div className="relative bg-gradient-to-br from-[#1A2A3A] via-[#1E3A46] to-[#17705A] px-5 py-4 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2">
            <QrCode size={16} className="text-[#7BE0C0]" />
            <h3 className="text-[15px] font-bold tracking-tight">{copy.title}</h3>
            <span className="px-1.5 py-0.5 rounded-md bg-[#7BE0C0]/15 border border-[#7BE0C0]/35 text-[#9DECD3] text-[10px] font-bold">
              {copy.tag}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-white/70">
            开通由零碳云管家顾问完成，扫码后请告知站点信息
          </p>
        </div>

        {/* 二维码 */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex flex-col items-center">
            <div className="p-2.5 rounded-xl border border-[#E3E8EE] bg-white shadow-xs">
              <img
                src="/qr-lingtan.svg"
                alt="零碳云管家二维码"
                className="w-[165px] h-[165px] block"
              />
            </div>
            <div className="mt-3 text-[13px] font-bold text-[#1A2A3A]">
              微信扫码添加「零碳云管家」
            </div>
            <p className="mt-1 text-[11px] text-[#5A6B7C] leading-relaxed text-center">
              {copy.desc}
            </p>
          </div>

          {/* 三步说明 */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className="rounded-lg border border-[#EAEDF2] bg-[#F9FBFC] px-2 py-2 text-center"
              >
                <div className="mx-auto mb-1 w-5 h-5 rounded-full bg-[#E8F7F1] text-[#17705A] text-[10px] font-black flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="text-[10px] text-[#5A6B7C] font-bold leading-tight">{s}</div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 flex items-start gap-1.5 text-[10px] text-[#8A98A6] leading-relaxed">
            <CheckCircle2 size={11} className="text-[#1E9C7E] mt-0.5 shrink-0" />
            <span>{copy.note}</span>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#EAEDF2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-bold bg-[#1E9C7E] hover:bg-[#17705A] text-white transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZeroCarbonQrModal;

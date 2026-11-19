/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /**
       * 字体规范：正文一律 sans，数字与表格式读数走 mono。
       * 不引外部字体（现场可能没网），只用系统字体栈。
       */
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'PingFang SC',
          'Microsoft YaHei',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['SFMono-Regular', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      /**
       * 字号规范（六档，别再用 8/8.5/9.5/10.5/11.5/12.5 这类半像素）：
       *
       *   caption 10px  —— 角标、序号、极小徽标
       *   label   11px  —— 字段名、表格副行、图注
       *   body    12px  —— 正文最小号，卡片内说明
       *   sub     13px  —— 正文默认
       *   title   14px  —— 区块标题
       *   heading 18px  —— 页面标题
       *
       * 14px 直接用 Tailwind 的 text-sm，12px 也可用 text-xs。
       * 大数字（18/22/24/30/34）属于数据展示，不在这套文字层级里。
       */
      fontSize: {
        caption: ['10px', { lineHeight: '14px' }],
        label: ['11px', { lineHeight: '16px' }],
        body: ['12px', { lineHeight: '18px' }],
        sub: ['13px', { lineHeight: '20px' }],
        title: ['14px', { lineHeight: '22px' }],
        heading: ['18px', { lineHeight: '26px' }],
      },
      /** 圆角规范：卡片 16，内部小块 12，控件 6~8 */
      borderRadius: {
        card: '16px',
        block: '12px',
      },
    },
  },
  plugins: [],
};

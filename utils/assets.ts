
/**
 * 将 SVG 字符串转换为 Base64 编码的 Data URI。
 * 使用 encodeURIComponent 和 unescape 处理 Unicode 字符，防止 btoa 报错。
 */
const svgToBase64 = (svg: string) => {
  try {
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
  } catch (e) {
    console.error('Failed to encode SVG to base64', e);
    return '';
  }
};

export const ASSETS = {
  // 经典小怪物：增加 viewBox 空间并重新校准路径
  player: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <g stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <!-- 四条小腿 -->
      <path d="M25 58 v8 M33 58 v8 M41 58 v8 M49 58 v8" fill="none"/>
      <!-- 身体与长鼻子 -->
      <path d="M20 58 Q20 20 45 20 Q55 20 57 33 C63 33 67 27 72 27 L72 47 C67 47 63 42 57 42 L57 58 Z" fill="#d2e037"/>
      <!-- 鼻子末端 -->
      <ellipse cx="72" cy="37" rx="4" ry="10" fill="#d2e037"/>
      <!-- 身体纹路 -->
      <path d="M22 45 h32 M22 50 h32 M22 55 h32" stroke-width="2" opacity="0.2"/>
      <!-- 眼睛 -->
      <circle cx="45" cy="30" r="2.5" fill="black" stroke="none"/>
      <circle cx="53" cy="30" r="2.5" fill="black" stroke="none"/>
    </g>
  </svg>`),
  
  platformNormal: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 15"><rect width="60" height="15" rx="5" fill="%238bc34a" stroke="%23333" stroke-width="2"/><path d="M5 4h50" stroke="white" stroke-width="1" opacity="0.3"/></svg>`,
  platformMoving: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 15"><rect width="60" height="15" rx="5" fill="%232196f3" stroke="%23333" stroke-width="2"/><circle cx="30" cy="7.5" r="3" fill="white" opacity="0.5"/></svg>`,
  platformBreaking: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 15"><rect width="60" height="15" rx="5" fill="%23795548" stroke="%23333" stroke-width="2"/><path d="M25 0l5 15M35 0l-5 15" stroke="%233e2723" stroke-width="2"/></svg>`,
  
  spring: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 18l16 0M6 15l12 0M8 12l8 0M10 9l4 0" fill="none" stroke="%239e9e9e" stroke-width="3" stroke-linecap="round"/></svg>`,
  rocket: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l4 6v10l-4 4-4-4V8l4-6z" fill="%23f44336" stroke="%23333" stroke-width="1.5"/><path d="M8 18l-3 4M16 18l3 4" stroke="%23333" stroke-width="1.5"/></svg>`,
  shield: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2L4 5v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V5l-8-3z" fill="%2303a9f4" stroke="white" stroke-width="1.5" opacity="0.8"/></svg>`,
  coin: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ffeb3b" stroke="%23fbc02d" stroke-width="2"/><text x="12" y="17" font-family="Arial" font-weight="bold" font-size="14" text-anchor="middle" fill="%23fbc02d">$</text></svg>`,
};

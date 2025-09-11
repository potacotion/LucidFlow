/**
 * 根据字符串生成一个固定、好看的 HSL 颜色值
 * @param {string} str 输入的字符串
 * @returns {object} 包含 HSL 信息的对象
 */
export function stringToColor(str: string) {
  // 防止空字符串或非字符串输入导致错误
  if (!str || typeof str !== 'string') {
    return {
      hsl: `hsl(0, 0%, 70%)`, // 返回一个默认灰色
      hue: 0,
      saturation: 0,
      lightness: 70,
    }
  }

  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i)
  }

  const hue = Math.abs(hash % 360)
  const saturation = 65 + (Math.abs(hash) % 21)
  const lightness = 45 + (Math.abs(hash >> 8) % 16)

  return {
    hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    hue: hue,
    saturation: saturation,
    lightness: lightness,
  }
}

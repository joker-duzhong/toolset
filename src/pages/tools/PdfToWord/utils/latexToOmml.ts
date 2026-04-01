/**
 * LaTeX 转 MathML
 * 简化版本，支持常用数学符号
 */
export function latexToMathML(latex: string): string {
  let ml = latex

  // 基础替换
  const replacements: unknown[] = [
    // 分数 \frac{a}{b} -> <mfrac>...
    [/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<mfrac><mrow>$1</mrow><mrow>$2</mrow></mfrac>'],

    // 上标 x^2 -> <msup>x2</msup>
    [/\^(\{[^}]+\}|.)/g, (_: unknown, p1: unknown) => {
      const content = (p1 as string).startsWith('{') ? (p1 as string).slice(1, -1) : p1
      return `<msup><mrow></mrow><mrow>${content}</mrow></msup>`
    }],

    // 下标 x_2 -> <msub>x2</msub>
    [/_\{([^}]+)\}/g, '<msub><mrow></mrow><mrow>$1</mrow></msub>'],
    [/_(.)/g, '<msub><mrow></mrow><mrow>$1</mrow></msub>'],

    // 平方根 \sqrt{x} -> <msqrt>x</msqrt>
    [/\\sqrt\{([^}]+)\}/g, '<msqrt><mrow>$1</mrow></msqrt>'],

    // n次根 \sqrt[n]{x}
    [/\\sqrt\[(.+)\]\{([^}]+)\}/g, '<mroot><mrow>$2</mrow><mrow>$1</mrow></mroot>'],

    // 希腊字母
    [/\\alpha/g, 'α'],
    [/\\beta/g, 'β'],
    [/\\gamma/g, 'γ'],
    [/\\delta/g, 'δ'],
    [/\\epsilon/g, 'ε'],
    [/\\theta/g, 'θ'],
    [/\\lambda/g, 'λ'],
    [/\\mu/g, 'μ'],
    [/\\pi/g, 'π'],
    [/\\sigma/g, 'σ'],
    [/\\omega/g, 'ω'],
    [/\\Omega/g, 'Ω'],
    [/\\Delta/g, 'Δ'],
    [/\\Sigma/g, 'Σ'],
    [/\\Pi/g, 'Π'],

    // 特殊符号
    [/\\infty/g, '∞'],
    [/\\pm/g, '±'],
    [/\\mp/g, '∓'],
    [/\\times/g, '×'],
    [/\\div/g, '÷'],
    [/\\cdot/g, '·'],
    [/\\leq/g, '≤'],
    [/\\geq/g, '≥'],
    [/\\neq/g, '≠'],
    [/\\approx/g, '≈'],
    [/\\equiv/g, '≡'],
    [/\\sum/g, '∑'],
    [/\\prod/g, '∏'],
    [/\\int/g, '∫'],
    [/\\partial/g, '∂'],
    [/\\nabla/g, '∇'],

    // 清理剩余的反斜杠命令
    [/\\[a-zA-Z]+/g, ''],
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [pattern, replacement] of replacements as any[]) {
    ml = ml.replace(pattern, replacement)
  }

  // 包装成 MathML
  return `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${ml}</mrow></math>`
}

/**
 * 将 LaTeX 转换为 Word 可识别的 OMML 格式
 * 由于 OMML 比较复杂，这里我们使用 docx 库的 Math 功能
 * 此函数返回简化的格式供 docx 库使用
 */
export interface MathNode {
  type: 'text' | 'fraction' | 'superscript' | 'subscript' | 'sqrt' | 'root'
  value?: string
  numerator?: MathNode
  denominator?: MathNode
  base?: MathNode
  exponent?: MathNode
  index?: MathNode
  content?: MathNode
  degree?: MathNode
  children?: MathNode[]
}

/**
 * 解析 LaTeX 为结构化的数学节点树
 */
export function parseLatex(latex: string): MathNode[] {
  const nodes: MathNode[] = []
  let remaining = latex.trim()

  while (remaining.length > 0) {
    // 分数
    if (remaining.startsWith('\\frac{')) {
      const match = remaining.match(/^\\frac\{([^}]*)\}\{([^}]*)\}/)
      if (match) {
        nodes.push({
          type: 'fraction',
          numerator: { type: 'text', value: match[1] },
          denominator: { type: 'text', value: match[2] },
        })
        remaining = remaining.slice(match[0].length)
        continue
      }
    }

    // 平方根
    if (remaining.startsWith('\\sqrt{')) {
      const match = remaining.match(/^\\sqrt\{([^}]*)\}/)
      if (match) {
        nodes.push({
          type: 'sqrt',
          content: { type: 'text', value: match[1] },
        })
        remaining = remaining.slice(match[0].length)
        continue
      }
    }

    // n 次根
    if (remaining.startsWith('\\sqrt[')) {
      const match = remaining.match(/^\\sqrt\[([^\]]*)\]\{([^}]*)\}/)
      if (match) {
        nodes.push({
          type: 'root',
          degree: { type: 'text', value: match[1] },
          content: { type: 'text', value: match[2] },
        })
        remaining = remaining.slice(match[0].length)
        continue
      }
    }

    // 上标
    const supMatch = remaining.match(/^([^{]+)\^\{([^}]*)\}/)
    if (supMatch) {
      nodes.push({
        type: 'superscript',
        base: { type: 'text', value: supMatch[1] },
        exponent: { type: 'text', value: supMatch[2] },
      })
      remaining = remaining.slice(supMatch[0].length)
      continue
    }

    // 下标
    const subMatch = remaining.match(/^([^{]+)_\{([^}]*)\}/)
    if (subMatch) {
      nodes.push({
        type: 'subscript',
        base: { type: 'text', value: subMatch[1] },
        index: { type: 'text', value: subMatch[2] },
      })
      remaining = remaining.slice(subMatch[0].length)
      continue
    }

    // 特殊符号替换
    const symbolMap: Record<string, string> = {
      '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
      '\\epsilon': 'ε', '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ',
      '\\pi': 'π', '\\sigma': 'σ', '\\omega': 'ω', '\\Omega': 'Ω',
      '\\Delta': 'Δ', '\\Sigma': 'Σ', '\\Pi': 'Π',
      '\\infty': '∞', '\\pm': '±', '\\times': '×', '\\div': '÷',
      '\\cdot': '·', '\\leq': '≤', '\\geq': '≥', '\\neq': '≠',
      '\\approx': '≈', '\\equiv': '≡', '\\sum': '∑', '\\prod': '∏',
      '\\int': '∫', '\\partial': '∂', '\\nabla': '∇',
    }

    let symbolFound = false
    for (const [symbol, replacement] of Object.entries(symbolMap)) {
      if (remaining.startsWith(symbol)) {
        nodes.push({ type: 'text', value: replacement })
        remaining = remaining.slice(symbol.length)
        symbolFound = true
        break
      }
    }
    if (symbolFound) continue

    // 普通文本 - 取到下一个特殊字符
    const textMatch = remaining.match(/^([^\\{}_^]+|\\[^a-zA-Z]?)/)
    if (textMatch && textMatch[0].length > 0) {
      nodes.push({ type: 'text', value: textMatch[0] })
      remaining = remaining.slice(textMatch[0].length)
      continue
    }

    // 跳过无法解析的字符
    remaining = remaining.slice(1)
  }

  return nodes
}

/**
 * 将 LaTeX 转换为纯文本（用于备用显示）
 */
export function latexToText(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '$1次根($2)')
    .replace(/\^\{([^}]*)\}/g, '^($1)')
    .replace(/_\{([^}]*)\}/g, '_($1)')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\sum/g, '∑')
    .replace(/\\int/g, '∫')
    .replace(/\\/g, '')
}

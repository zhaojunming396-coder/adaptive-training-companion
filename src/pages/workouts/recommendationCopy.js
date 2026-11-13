const labels = {
  '建议维持重量': '维持',
  '建议加重量': '加重',
  '建议降低重量': '减重',
  '建议维持时长': '维持时长',
  '建议增加时长': '增加时长',
  '暂无建议': '建立基准'
};

export function recommendationLabel({ strategy }) {
  return labels[strategy] || strategy;
}

export function recommendationReason({ reason = '' }) {
  // Keep the reason supplied by the rules; present its first sentence in the UI.
  return reason.split('。', 1)[0].replace(/^参考最近 \d+ 次同动作记录：/, '') || '完成训练记录后再生成建议';
}

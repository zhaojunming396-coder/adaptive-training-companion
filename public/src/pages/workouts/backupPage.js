import {
  buildBackupPayload,
  getBeforeImportBackupFileName,
  getBackupFileName,
  restoreBackupPayload,
  saveBackupBeforeImport,
  validateBackupPayload
} from '../../data/workouts/localBackup.js';
import { navigateTo } from './appState.js';

function renderNotice(page, type, message) {
  const notice = document.createElement('div');
  notice.className = 'notice';
  const title = document.createElement('strong');
  title.textContent = type === 'success' ? '操作成功' : '操作失败';
  notice.appendChild(title);
  const text = document.createElement('p');
  text.textContent = message;
  notice.appendChild(text);
  page.appendChild(notice);
}

function downloadJson(payload, fileName = getBackupFileName()) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('读取备份文件失败。'));
    reader.readAsText(file);
  });
}

export function renderBackupPage(root, message = null) {
  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const hero = document.createElement('section');
  hero.className = 'hero-card';
  hero.innerHTML = '<p class="eyebrow">本地 JSON</p><h1>数据备份</h1><p>导出和导入只处理本机训练数据，不会上传到服务器。</p>';
  page.appendChild(hero);

  if (message) {
    renderNotice(page, message.type, message.text);
  }

  const exportCard = document.createElement('section');
  exportCard.className = 'exercise';
  const exportTitle = document.createElement('h2');
  exportTitle.textContent = '导出备份';
  exportCard.appendChild(exportTitle);
  const exportDesc = document.createElement('p');
  exportDesc.textContent = '导出内容包括训练档案、训练历史、手动选择训练日和休息震动开关。';
  exportCard.appendChild(exportDesc);
  const exportButton = document.createElement('button');
  exportButton.textContent = '导出 JSON 文件';
  exportButton.addEventListener('click', () => {
    try {
      downloadJson(buildBackupPayload());
    } catch (error) {
      renderBackupPage(root, { type: 'error', text: error.message || '导出失败。' });
    }
  });
  exportCard.appendChild(exportButton);
  page.appendChild(exportCard);

  const importCard = document.createElement('section');
  importCard.className = 'exercise';
  const importTitle = document.createElement('h2');
  importTitle.textContent = '导入备份';
  importCard.appendChild(importTitle);
  const importDesc = document.createElement('p');
  importDesc.textContent = '导入会覆盖当前本地训练数据，请先确认文件来源可靠。';
  importCard.appendChild(importDesc);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];

    if (!file) {
      return;
    }

    if (!window.confirm('导入会覆盖当前本地训练数据，是否继续？')) {
      fileInput.value = '';
      return;
    }

    try {
      const text = await readFileAsText(file);
      const payload = JSON.parse(text);
      const validation = validateBackupPayload(payload);

      if (!validation.ok) {
        renderBackupPage(root, { type: 'error', text: validation.error || '备份文件格式错误。' });
        return;
      }

      const beforeImportPayload = saveBackupBeforeImport();

      try {
        downloadJson(beforeImportPayload, getBeforeImportBackupFileName());
      } catch {
        // 如果浏览器拦截自动下载，backupBeforeImport.v1 仍保留当前数据。
      }

      const result = restoreBackupPayload(payload);

      if (!result.ok) {
        renderBackupPage(root, { type: 'error', text: result.error || '备份文件格式错误。' });
        return;
      }

      window.alert('导入成功，已在导入前备份当前数据。');
      window.location.reload();
    } catch {
      renderBackupPage(root, { type: 'error', text: 'JSON 格式错误，请选择有效的备份文件。' });
    }
  });
  importCard.appendChild(fileInput);
  page.appendChild(importCard);

  const actions = document.createElement('div');
  actions.className = 'actions';
  const todayButton = document.createElement('button');
  todayButton.className = 'secondary-button';
  todayButton.textContent = '返回今日训练';
  todayButton.addEventListener('click', () => navigateTo('today'));
  actions.appendChild(todayButton);
  page.appendChild(actions);

  root.appendChild(page);
}

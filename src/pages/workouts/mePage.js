export function renderMePage(root) {
  root.innerHTML = `
    <section class="page">
      <header class="record-header"><h1>我的</h1></header>
      <ul class="me-links">
        <li><a href="#profile">档案</a></li>
        <li><a href="#nutrition">补剂</a></li>
        <li><a href="#backup">备份</a></li>
        <li><a href="#analytics">分析</a></li>
      </ul>
    </section>`;
}

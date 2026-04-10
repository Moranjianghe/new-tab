const extensionApi = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : null;
const hasPromiseApi = typeof browser !== "undefined";
const historyApi = extensionApi && extensionApi.history;
const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString();
};

const historySearch = (text) => {
  if (!historyApi) return Promise.reject(new Error("history api unavailable"));
  const query = { text, startTime: 0, maxResults: 500 };
  if (hasPromiseApi) return historyApi.search(query);
  return new Promise((resolve, reject) => {
    historyApi.search(query, (items) => {
      const err = chrome.runtime && chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve(items || []);
    });
  });
};

const renderList = (items) => {
  listEl.textContent = "";
  if (!items.length) {
    statusEl.textContent = "没有找到记录";
    return;
  }

  statusEl.textContent = `共 ${items.length} 条`;
  const frag = document.createDocumentFragment();
  for (const item of items) {
    const row = document.createElement("article");
    row.className = "item";

    const link = document.createElement("a");
    link.className = "title";
    link.href = item.url || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.title || item.url || "(无标题)";

    const meta = document.createElement("div");
    meta.className = "meta";
    const parts = [];
    if (item.lastVisitTime) parts.push(formatTime(item.lastVisitTime));
    if (item.url) parts.push(item.url);
    meta.textContent = parts.join(" | ");

    row.append(link, meta);
    frag.appendChild(row);
  }
  listEl.appendChild(frag);
};

const loadHistory = async () => {
  try {
    statusEl.textContent = "加载中...";
    const term = searchEl.value.trim();
    const items = await historySearch(term);
    items.sort((a, b) => (b.lastVisitTime || 0) - (a.lastVisitTime || 0));
    renderList(items);
  } catch (error) {
    statusEl.textContent = "读取历史记录失败";
    console.error(error);
  }
};

let timer = null;
searchEl.addEventListener("input", () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(loadHistory, 220);
});

loadHistory();

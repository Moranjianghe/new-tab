const extensionApi = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : null;
const runtimeApi = extensionApi && extensionApi.runtime;
const bookmarksApi = extensionApi && extensionApi.bookmarks;
const hasPromiseApi = typeof browser !== "undefined";

const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");

const isExtensionContext = location.protocol === "moz-extension:" || location.protocol === "chrome-extension:";

const showError = (message) => {
  listEl.textContent = "";
  statusEl.textContent = message;
  statusEl.style.color = "#d93025";
};

const getTree = () => {
  if (!bookmarksApi) return Promise.reject(new Error("bookmarks api unavailable"));

  if (hasPromiseApi) return bookmarksApi.getTree();

  return new Promise((resolve, reject) => {
    bookmarksApi.getTree((items) => {
      const err = runtimeApi && runtimeApi.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve(items || []);
    });
  });
};

const flatten = (nodes, depth = 0, bucket = []) => {
  for (const node of nodes || []) {
    if (!node) continue;

    const isFolder = !node.url;
    if (depth > 0 || node.title) {
      bucket.push({
        isFolder,
        depth,
        title: node.title || (isFolder ? "(未命名文件夹)" : "(无标题)"),
        url: node.url || "",
      });
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      flatten(node.children, depth + 1, bucket);
    }
  }

  return bucket;
};

const renderList = (items) => {
  listEl.textContent = "";
  if (!items.length) {
    statusEl.textContent = "没有找到书签";
    return;
  }

  statusEl.textContent = `共 ${items.length} 条`;
  const frag = document.createDocumentFragment();

  for (const item of items) {
    const row = document.createElement("article");
    row.className = "item";
    row.style.paddingLeft = `${12 + Math.min(item.depth, 6) * 16}px`;

    if (item.isFolder) {
      const folder = document.createElement("div");
      folder.className = "folder";
      folder.textContent = item.title;
      row.appendChild(folder);
    } else {
      const link = document.createElement("a");
      link.className = "title";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.title;

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = item.url;

      row.append(link, meta);
    }

    frag.appendChild(row);
  }

  listEl.appendChild(frag);
};

const loadBookmarks = async () => {
  try {
    statusEl.style.color = "";
    statusEl.textContent = "加载中...";
    const tree = await getTree();
    const items = flatten(tree);
    renderList(items);
  } catch (error) {
    showError("读取书签失败，请确认扩展权限已开启。");
    console.error(error);
  }
};

if (!isExtensionContext) {
  showError("错误：当前不是扩展页面。请从浏览器新标签页或扩展内打开。");
} else if (!runtimeApi || !bookmarksApi) {
  showError("错误：扩展 API 不可用，无法读取书签。");
} else {
  loadBookmarks();
}

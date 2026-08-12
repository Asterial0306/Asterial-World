/* ============================================================
   自制文章渲染器（无第三方依赖）
   支持语法：
   - 标题： # / ## / ###
   - 段落：空行分隔
   - 无序列表：- 开头
   - 有序列表：1. 开头
   - 引用：> 开头
   - 代码块：``` 包裹
   - 行内：**加粗**、*斜体*、`行内代码`、[链接](url)
   ============================================================ */
window.renderMarkdown = function (src) {
  if (!src) return "";

  var lines = String(src).replace(/\r\n/g, "\n").split("\n");
  var html = "";
  var i = 0;
  var inCode = false;
  var codeBuf = [];
  var listType = null; // "ul" | "ol"

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function closeList() {
    if (listType) {
      html += "</" + listType + ">";
      listType = null;
    }
  }

  function inline(text) {
    return text
      .replace(/`([^`]+)`/g, function (m, c) { return "<code>" + escapeHtml(c) + "</code>"; })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  for (; i < lines.length; i++) {
    var line = lines[i];

    // 代码块
    if (/^```/.test(line)) {
      if (!inCode) {
        closeList();
        inCode = true;
        codeBuf = [];
        html += "<pre><code>";
      } else {
        inCode = false;
        html += escapeHtml(codeBuf.join("\n")) + "</code></pre>";
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    // 标题
    var h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      html += "<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">";
      continue;
    }

    // 引用
    var quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      closeList();
      html += "<blockquote>" + inline(quote[1]) + "</blockquote>";
      continue;
    }

    // 无序列表
    var ul = /^-\s+(.*)$/.exec(line);
    if (ul) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html += "<ul>";
      }
      html += "<li>" + inline(ul[1]) + "</li>";
      continue;
    }

    // 有序列表
    var ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html += "<ol>";
      }
      html += "<li>" + inline(ol[1]) + "</li>";
      continue;
    }

    // 空行：结束当前列表
    if (/^\s*$/.test(line)) {
      closeList();
      continue;
    }

    // 普通段落
    closeList();
    html += "<p>" + inline(line) + "</p>";
  }

  if (inCode) {
    html += escapeHtml(codeBuf.join("\n")) + "</code></pre>";
  }
  closeList();

  return html;
};

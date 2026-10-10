
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCfqgWRNYumr7e571iknAPna3NgrIpDbU1LMn5IleU4dap9nHxUHVbSVz-DQVR1DkdzmoVbsDirQv4/pub?gid=1762060767&single=true&output=csv";
        

// 1. 抓取 CSV、解析並繪製表格
async function loadItinerary() {
  const loadingEl = document.getElementById("loading");
  const table = document.getElementById("data-table");

  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    // 拆解列與欄
    const rows = csvText.trim().split("\n").map((row) => row.split(","));
    table.innerHTML = "";

    rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      row.forEach((cellText) => {
        const cell = document.createElement(rowIndex === 0 ? "th" : "td");
        cell.textContent = cellText.replace(/^["']|["']$/g, "").trim(); // 清理引號與前後空白
        tr.appendChild(cell);
      });
      table.appendChild(tr);
    });

    if (loadingEl) loadingEl.style.display = "none";
    table.style.display = "table";

    // 表格生成完成後，執行地圖網址掃描與轉換
    formatTableCells();

    // 綁定整欄點擊高亮
    bindTableClick();
  } catch (error) {
    if (loadingEl) loadingEl.textContent = "資料讀取失敗，請確認網址權限。";
    console.error("載入失敗：", error);
  }
}

// 2. 掃描所有 <td>，將開頭為 https://maps.app 的文字轉為可點擊超連結
function formatTableCells() {
  const tripTable = document.getElementById("data-table");
  if (!tripTable) return;

  const allTds = tripTable.querySelectorAll("td");

  allTds.forEach((td) => {
    const text = td.textContent.trim();

    // const mapRegex = /(https:\/\/maps\.app[^\s<]+)/g;
    // if (mapRegex.text(content)) {
    //   td.classList.add("map");

    //   // 將網址替換為按鈕標籤，保留前後原本的文字
    //   content = content.replace(
    //     mapRegex,
    //     '<a href="$1" target="_blank" rel="noopener noreferrer" class="map-btn">MAP</a>'
    //   );
    // }

    if (text.startsWith("https://maps.app")) {
      td.classList.add("map");

      const link = document.createElement("a");
      link.href = text;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "MAP";

      td.textContent = "";
      td.appendChild(link);
    }

    if (/\bto\b/i.test(td.innerHTML)) {
        td.innerHTML = td.innerHTML.replace(
            /\bto\b/gi,
            "<i class='fas fa-angle-double-right to'></i>"
        );
    }
    if (/\bgo\b/i.test(td.innerHTML)) {
        td.innerHTML = td.innerHTML.replace(
            /\bgo\b/gi,
            "<i class='fas fa-car-side go'></i>"
        );
    }

  });
}

// 3. 綁定整欄高亮點擊事件
function bindTableClick() {
  const tripTable = document.getElementById("data-table");
  if (!tripTable) return;

  tripTable.addEventListener("click", (event) => {
    const cell = event.target.closest("td, th");
    if (!cell) return;

    const colIndex = cell.cellIndex;

    // 清除先前選取
    tripTable.querySelectorAll("td, th").forEach((el) => {
      el.classList.remove("active");
    });

    // 選取點擊欄位的每一格
    const targetCells = tripTable.querySelectorAll(
      `tr td:nth-child(${colIndex + 1}), tr th:nth-child(${colIndex + 1})`
    );

    targetCells.forEach((el) => {
      el.classList.add("active");
    });

    cell.scrollIntoView({
        behavior: 'smooth',
        inline: 'center', // 也可以改成 'start' 讓它貼齊左側
        block: 'nearest'  // 避免垂直畫面被拉扯
      });
  });
}

// 4. 頁面 DOM 載入後啟動載入程序
document.addEventListener("DOMContentLoaded", loadItinerary);
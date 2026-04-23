/* Paging simulator: FIFO vs LRU */
window.PagingGame = (function () {
  function mount(root) {
    let seq = "7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1";
    let frames = 3;
    let algo = "LRU";

    function render() {
      root.innerHTML = `
        <h3>Simulador de Paginação</h3>
        <div class="game-controls">
          <label>Páginas (separadas por espaço):
            <input type="text" data-seq value="${seq}" style="width:280px">
          </label>
          <label>Quadros:
            <input type="number" min="1" max="8" data-frames value="${frames}">
          </label>
          <label>Algoritmo:
            <select data-algo>
              <option ${algo==="FIFO"?"selected":""}>FIFO</option>
              <option ${algo==="LRU"?"selected":""}>LRU</option>
            </select>
          </label>
          <button class="btn primary" data-run>Executar</button>
        </div>
        <div data-output></div>
      `;
      root.querySelector("[data-seq]").addEventListener("input", e => seq = e.target.value);
      root.querySelector("[data-frames]").addEventListener("input", e => frames = Math.max(1, +e.target.value||1));
      root.querySelector("[data-algo]").addEventListener("change", e => algo = e.target.value);
      root.querySelector("[data-run]").addEventListener("click", run);
    }

    function run() {
      const pages = seq.trim().split(/\s+/).map(x => +x).filter(x => !isNaN(x));
      const out = root.querySelector("[data-output]");
      if (!pages.length) { out.innerHTML = "<p class='muted'>Sequência inválida.</p>"; return; }

      const log = algo === "FIFO" ? runFIFO(pages, frames) : runLRU(pages, frames);
      const misses = log.filter(s => !s.hit).length;
      const hits = log.length - misses;

      let html = `<p class="muted mt-2">Hits: <strong style="color:var(--success)">${hits}</strong>
                  &nbsp; Misses (page faults): <strong style="color:var(--danger)">${misses}</strong>
                  &nbsp; Total: ${log.length}</p>`;
      html += `<div style="overflow-x:auto"><table><thead><tr><th>Passo</th><th>Página</th>${
        Array.from({length:frames}, (_,i)=>`<th>F${i+1}</th>`).join("")
      }<th>Status</th></tr></thead><tbody>`;
      log.forEach((s, idx) => {
        html += `<tr>
          <td>${idx+1}</td>
          <td><strong>${s.page}</strong></td>
          ${Array.from({length:frames}, (_,i)=>{
            const v = s.state[i];
            const cls = s.loadedIndex === i ? (s.hit ? "hit" : "miss") : "";
            return `<td><span class="frame ${cls}" style="min-width:40px;height:36px">${v===undefined?'-':v}</span></td>`;
          }).join("")}
          <td>${s.hit ? '<span class="chip ok">HIT</span>' : '<span class="chip danger">MISS</span>'}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      out.innerHTML = html;
    }

    function runFIFO(pages, size) {
      const mem = []; const order = [];
      const log = [];
      pages.forEach(p => {
        const idx = mem.indexOf(p);
        if (idx >= 0) {
          log.push({ page: p, hit: true, state: [...mem], loadedIndex: idx });
        } else {
          if (mem.length < size) {
            mem.push(p); order.push(mem.length - 1);
            log.push({ page: p, hit: false, state: [...mem], loadedIndex: mem.length - 1 });
          } else {
            const victim = order.shift();
            mem[victim] = p; order.push(victim);
            log.push({ page: p, hit: false, state: [...mem], loadedIndex: victim });
          }
        }
      });
      return log;
    }

    function runLRU(pages, size) {
      const mem = [];
      const lastUsed = new Map();
      const log = [];
      pages.forEach((p, t) => {
        const idx = mem.indexOf(p);
        if (idx >= 0) {
          lastUsed.set(p, t);
          log.push({ page: p, hit: true, state: [...mem], loadedIndex: idx });
        } else {
          if (mem.length < size) {
            mem.push(p); lastUsed.set(p, t);
            log.push({ page: p, hit: false, state: [...mem], loadedIndex: mem.length - 1 });
          } else {
            let lruPage = null, lruT = Infinity;
            mem.forEach(m => {
              const lt = lastUsed.get(m);
              if (lt < lruT) { lruT = lt; lruPage = m; }
            });
            const vi = mem.indexOf(lruPage);
            mem[vi] = p; lastUsed.delete(lruPage); lastUsed.set(p, t);
            log.push({ page: p, hit: false, state: [...mem], loadedIndex: vi });
          }
        }
      });
      return log;
    }

    render();
  }
  return { mount };
})();

/* Scheduler simulator: FCFS, SJF (non-preemptive), Round-Robin */
window.SchedulerGame = (function () {
  const COLORS = ["#22d3ee", "#f472b6", "#fbbf24", "#a78bfa", "#34d399", "#f87171", "#60a5fa", "#fb923c"];

  function mount(root) {
    let procs = [
      { id: "P1", arrival: 0, burst: 5 },
      { id: "P2", arrival: 1, burst: 3 },
      { id: "P3", arrival: 2, burst: 8 },
      { id: "P4", arrival: 3, burst: 2 },
    ];
    let algo = "FCFS";
    let quantum = 2;

    function render() {
      root.innerHTML = `
        <h3>Simulador de Escalonamento</h3>
        <p class="muted">Defina os processos e o algoritmo. Clique em <strong>Executar</strong> para ver o Gantt.</p>
        <div class="game-controls">
          <label>Algoritmo
            <select data-algo>
              <option value="FCFS" ${algo==="FCFS"?"selected":""}>FCFS</option>
              <option value="SJF" ${algo==="SJF"?"selected":""}>SJF (não-preemptivo)</option>
              <option value="RR" ${algo==="RR"?"selected":""}>Round-Robin</option>
            </select>
          </label>
          <label data-rr-only ${algo==="RR"?"":"hidden"}>Quantum
            <input type="number" min="1" max="20" value="${quantum}" data-quantum>
          </label>
          <button class="btn primary" data-run>Executar</button>
          <button class="btn ghost" data-add>+ Processo</button>
          <button class="btn ghost" data-reset>Resetar</button>
        </div>
        <table class="process-table">
          <thead><tr><th>Processo</th><th>Chegada</th><th>Burst</th><th></th></tr></thead>
          <tbody>
            ${procs.map((p, i) => `
              <tr>
                <td><input data-f="id" data-i="${i}" value="${p.id}" style="width:60px"></td>
                <td><input data-f="arrival" data-i="${i}" type="number" min="0" value="${p.arrival}"></td>
                <td><input data-f="burst" data-i="${i}" type="number" min="1" value="${p.burst}"></td>
                <td><button class="btn small ghost" data-del="${i}">remover</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div data-output></div>
      `;

      root.querySelector("[data-algo]").addEventListener("change", e => {
        algo = e.target.value;
        render();
      });
      const qInput = root.querySelector("[data-quantum]");
      if (qInput) qInput.addEventListener("change", e => quantum = Math.max(1, +e.target.value || 1));

      root.querySelectorAll("input[data-f]").forEach(inp => {
        inp.addEventListener("input", () => {
          const i = +inp.dataset.i; const f = inp.dataset.f;
          if (f === "id") procs[i].id = inp.value.slice(0, 4) || "P";
          else procs[i][f] = Math.max(f==="burst"?1:0, +inp.value || 0);
        });
      });
      root.querySelectorAll("[data-del]").forEach(b =>
        b.addEventListener("click", () => { procs.splice(+b.dataset.del, 1); render(); })
      );
      root.querySelector("[data-add]").addEventListener("click", () => {
        procs.push({ id: "P" + (procs.length + 1), arrival: 0, burst: 3 });
        render();
      });
      root.querySelector("[data-reset]").addEventListener("click", () => {
        procs = [
          { id: "P1", arrival: 0, burst: 5 },
          { id: "P2", arrival: 1, burst: 3 },
          { id: "P3", arrival: 2, burst: 8 },
          { id: "P4", arrival: 3, burst: 2 },
        ];
        algo = "FCFS"; quantum = 2;
        render();
      });
      root.querySelector("[data-run]").addEventListener("click", run);
    }

    function run() {
      const out = root.querySelector("[data-output]");
      if (!procs.length) { out.innerHTML = "<p class='muted'>Adicione pelo menos um processo.</p>"; return; }
      let schedule;
      if (algo === "FCFS") schedule = simulateFCFS(procs);
      else if (algo === "SJF") schedule = simulateSJF(procs);
      else schedule = simulateRR(procs, quantum);

      const metrics = computeMetrics(procs, schedule);
      out.innerHTML = `
        <h4 style="margin-top:22px">Gráfico de Gantt</h4>
        ${renderGantt(schedule)}
        <h4 style="margin-top:14px">Métricas por processo</h4>
        <table>
          <thead><tr><th>Proc</th><th>Chegada</th><th>Burst</th><th>Início</th><th>Término</th><th>Espera</th><th>Retorno</th></tr></thead>
          <tbody>
            ${metrics.perProc.map(m => `<tr>
              <td><strong>${m.id}</strong></td><td>${m.arrival}</td><td>${m.burst}</td>
              <td>${m.start}</td><td>${m.end}</td><td>${m.wait}</td><td>${m.turnaround}</td>
            </tr>`).join("")}
          </tbody>
        </table>
        <p class="muted">Tempo médio de espera: <strong>${metrics.avgWait.toFixed(2)}</strong> —
        Tempo médio de retorno: <strong>${metrics.avgTurn.toFixed(2)}</strong></p>
      `;
    }

    function renderGantt(schedule) {
      const total = schedule.reduce((s, x) => s + x.length, 0);
      const colorOf = (id) => {
        if (id === "idle") return "#2a3570";
        const uniq = [...new Set(schedule.map(s => s.id).filter(i => i !== "idle"))];
        return COLORS[uniq.indexOf(id) % COLORS.length];
      };
      let t = 0;
      const blocks = schedule.map(s => {
        const start = t; t += s.length;
        return `<div class="gantt-slot ${s.id==='idle'?'idle':''}"
                     style="flex: ${s.length}; background: ${colorOf(s.id)};"
                     title="${s.id} (${start}→${t})">
                   ${s.id==='idle'?'idle':s.id}
                 </div>`;
      }).join("");
      // timeline ticks
      let ticks = '<div style="display:flex;font-size:.78rem;color:var(--muted);margin-top:4px;">';
      t = 0;
      schedule.forEach(s => {
        ticks += `<span style="flex:${s.length}; text-align:left">${t}</span>`;
        t += s.length;
      });
      ticks += `<span style="flex:0 0 auto">${total}</span></div>`;
      return `<div class="gantt">${blocks}</div>${ticks}`;
    }

    function mergeSchedule(raw) {
      const out = [];
      raw.forEach(s => {
        const last = out[out.length - 1];
        if (last && last.id === s.id) last.length += s.length;
        else out.push({ ...s });
      });
      return out;
    }

    function simulateFCFS(list) {
      const sorted = [...list].sort((a, b) => a.arrival - b.arrival);
      const sched = [];
      let t = 0;
      sorted.forEach(p => {
        if (t < p.arrival) { sched.push({ id: "idle", length: p.arrival - t }); t = p.arrival; }
        sched.push({ id: p.id, length: p.burst }); t += p.burst;
      });
      return mergeSchedule(sched);
    }

    function simulateSJF(list) {
      const remaining = list.map(p => ({ ...p }));
      const sched = [];
      let t = 0;
      while (remaining.length) {
        const ready = remaining.filter(p => p.arrival <= t);
        if (!ready.length) {
          const next = remaining.reduce((a, b) => a.arrival < b.arrival ? a : b);
          sched.push({ id: "idle", length: next.arrival - t });
          t = next.arrival;
          continue;
        }
        ready.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
        const p = ready[0];
        sched.push({ id: p.id, length: p.burst });
        t += p.burst;
        remaining.splice(remaining.indexOf(p), 1);
      }
      return mergeSchedule(sched);
    }

    function simulateRR(list, q) {
      const queue = [];
      const remaining = [...list].map(p => ({ ...p, rem: p.burst })).sort((a, b) => a.arrival - b.arrival);
      const sched = [];
      let t = 0;
      let i = 0;
      function admitNew() {
        while (i < remaining.length && remaining[i].arrival <= t) { queue.push(remaining[i]); i++; }
      }
      admitNew();
      while (queue.length || i < remaining.length) {
        if (!queue.length) {
          const nextT = remaining[i].arrival;
          sched.push({ id: "idle", length: nextT - t });
          t = nextT; admitNew(); continue;
        }
        const p = queue.shift();
        const slice = Math.min(q, p.rem);
        sched.push({ id: p.id, length: slice });
        t += slice; p.rem -= slice;
        admitNew();
        if (p.rem > 0) queue.push(p);
      }
      return mergeSchedule(sched);
    }

    function computeMetrics(original, schedule) {
      const first = {}, last = {};
      let t = 0;
      schedule.forEach(s => {
        if (s.id !== "idle") {
          if (first[s.id] === undefined) first[s.id] = t;
          last[s.id] = t + s.length;
        }
        t += s.length;
      });
      const perProc = original.map(p => {
        const start = first[p.id] ?? 0;
        const end = last[p.id] ?? 0;
        const turnaround = end - p.arrival;
        const wait = turnaround - p.burst;
        return { ...p, start, end, turnaround, wait };
      });
      const avgWait = perProc.reduce((s, m) => s + m.wait, 0) / perProc.length;
      const avgTurn = perProc.reduce((s, m) => s + m.turnaround, 0) / perProc.length;
      return { perProc, avgWait, avgTurn };
    }

    render();
  }

  return { mount };
})();

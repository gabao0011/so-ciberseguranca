/* chmod minigame: clique nos bits r/w/x e veja a permissão */
window.ChmodGame = (function () {
  function mount(root) {
    const groups = ["dono", "grupo", "outros"];
    // state[i] = { r, w, x }
    let state = groups.map(() => ({ r: false, w: false, x: false }));
    let target = null;

    function randomTarget() {
      return groups.map(() => ({ r: Math.random() > 0.3, w: Math.random() > 0.5, x: Math.random() > 0.5 }));
    }
    function fmt(s) {
      return s.map(g => `${g.r?"r":"-"}${g.w?"w":"-"}${g.x?"x":"-"}`).join("");
    }
    function octal(s) {
      return s.map(g => (g.r?4:0) + (g.w?2:0) + (g.x?1:0)).join("");
    }
    function render() {
      const current = fmt(state);
      const currentOct = octal(state);
      const tgt = target || { str: "—", oct: "—" };
      root.innerHTML = `
        <h3>Monte as permissões</h3>
        <p>Clique nos bits <code>r</code>, <code>w</code>, <code>x</code> para ligar/desligar.</p>
        ${target ? `
          <div class="callout">
            <strong>Objetivo:</strong> chegar em
            <code style="font-size:1.1rem">${target.str}</code>
            (<code>chmod ${target.oct}</code>)
          </div>
        ` : ''}
        <div class="chmod-grid">
          <div class="label"></div><div>r (4)</div><div>w (2)</div><div>x (1)</div>
          ${groups.map((g, i) => `
            <div class="label">${g}</div>
            <div class="bit ${state[i].r?"on":""}" data-g="${i}" data-b="r">r</div>
            <div class="bit ${state[i].w?"on":""}" data-g="${i}" data-b="w">w</div>
            <div class="bit ${state[i].x?"on":""}" data-g="${i}" data-b="x">x</div>
          `).join("")}
        </div>
        <p>Permissão atual: <code style="font-size:1.1rem">${current}</code>
           &nbsp; • &nbsp; Octal: <code>${currentOct}</code></p>
        <div class="row">
          <button class="btn primary" data-new>Novo desafio</button>
          <button class="btn ghost" data-zero>Zerar</button>
          ${target ? `<button class="btn so" data-check>Conferir</button>`: ''}
        </div>
        <div data-feedback style="margin-top:10px"></div>
      `;
      root.querySelectorAll(".bit").forEach(el => {
        el.addEventListener("click", () => {
          const g = +el.dataset.g; const b = el.dataset.b;
          state[g][b] = !state[g][b]; render();
        });
      });
      root.querySelector("[data-new]").addEventListener("click", () => {
        const t = randomTarget();
        target = { state: t, str: fmt(t), oct: octal(t) };
        state = groups.map(() => ({ r: false, w: false, x: false }));
        render();
      });
      root.querySelector("[data-zero]").addEventListener("click", () => {
        state = groups.map(() => ({ r: false, w: false, x: false }));
        render();
      });
      const chk = root.querySelector("[data-check]");
      if (chk) chk.addEventListener("click", () => {
        const ok = octal(state) === target.oct;
        root.querySelector("[data-feedback]").innerHTML =
          ok ? '<div class="quiz-result ok">Acertou! 🎉</div>'
             : `<div class="quiz-result bad">Ainda não. Alvo: ${target.str} (${target.oct})</div>`;
      });
    }

    render();
  }
  return { mount };
})();

/* Password strength meter (client-side only) */
window.PasswordGame = (function () {
  const COMMON = new Set([
    "123456","123456789","12345678","12345","qwerty","password","senha","abc123",
    "111111","123123","admin","iloveyou","1q2w3e","qwe123","654321","senha123",
    "gabriel","brasil","flamengo","corinthians","sãopaulo","palmeiras","vasco"
  ]);

  function mount(root) {
    let pwd = "";
    function render() {
      const res = score(pwd);
      root.innerHTML = `
        <h3>Medidor de força de senha</h3>
        <p class="muted">A senha é avaliada localmente no seu navegador e nada é enviado.</p>
        <div class="row" style="align-items:center; gap:10px;">
          <input type="text" id="pwd" style="flex:1;min-width:200px;padding:10px 12px;border-radius:10px;border:1px solid var(--border); background: var(--bg-soft); color: var(--text); font-family:var(--font-mono);" placeholder="digite uma senha de teste" value="${escapeAttr(pwd)}">
          <button class="btn ghost" data-gen>Gerar forte</button>
        </div>
        <div class="pw-meter"><div class="bar" style="width:${res.pct}%; background:${res.color};"></div></div>
        <p style="margin-top:8px"><strong>${res.label}</strong> — entropia estimada: ${res.entropy.toFixed(0)} bits <span class="muted">(${res.time})</span></p>
        <ul class="pw-criteria">
          ${res.criteria.map(c => `<li class="${c.met?'met':''}">${c.label}</li>`).join('')}
        </ul>
      `;
      const input = root.querySelector("#pwd");
      input.addEventListener("input", e => { pwd = e.target.value; render(); input.focus(); });
      root.querySelector("[data-gen]").addEventListener("click", () => { pwd = generate(); render(); });
    }
    function generate() {
      const words = ["urso","lua","sol","nuvem","cinza","dourado","correnteza","pangarea","cipreste","brasa","cachaca","violao","paralela","granja","mango","ferrao"];
      const pick = () => words[Math.floor(Math.random()*words.length)];
      return `${pick()}-${pick()}-${pick()}-${Math.floor(Math.random()*99)}!`;
    }
    function score(p) {
      const len = p.length;
      const hasLower = /[a-z]/.test(p);
      const hasUpper = /[A-Z]/.test(p);
      const hasDigit = /[0-9]/.test(p);
      const hasSym   = /[^A-Za-z0-9]/.test(p);
      const uniqueChars = new Set(p).size;
      const isCommon = COMMON.has(p.toLowerCase());

      let poolSize = 0;
      if (hasLower) poolSize += 26;
      if (hasUpper) poolSize += 26;
      if (hasDigit) poolSize += 10;
      if (hasSym)   poolSize += 32;
      if (!poolSize) poolSize = 1;
      const entropy = Math.log2(poolSize) * len;
      const effectiveEntropy = isCommon ? Math.min(entropy, 8) : entropy;

      let label, color;
      if (!len) { label = "vazio"; color = "#3a4590"; }
      else if (effectiveEntropy < 28) { label = "muito fraca"; color = "#f87171"; }
      else if (effectiveEntropy < 40) { label = "fraca";       color = "#fb923c"; }
      else if (effectiveEntropy < 60) { label = "razoável";    color = "#fbbf24"; }
      else if (effectiveEntropy < 80) { label = "forte";       color = "#34d399"; }
      else { label = "muito forte"; color = "#22d3ee"; }

      const time = estimateCrackTime(effectiveEntropy);
      const pct = Math.min(100, Math.max(0, (effectiveEntropy/100)*100));

      return {
        pct, color, entropy: effectiveEntropy, label, time,
        criteria: [
          { label: "Mínimo 12 caracteres", met: len >= 12 },
          { label: "Contém minúscula",     met: hasLower },
          { label: "Contém maiúscula",     met: hasUpper },
          { label: "Contém número",        met: hasDigit },
          { label: "Contém símbolo",       met: hasSym },
          { label: "Não é uma senha comum", met: !isCommon && !!len },
          { label: "Boa variedade de caracteres", met: uniqueChars >= 8 }
        ]
      };
    }
    function estimateCrackTime(bits) {
      // Assume 10^10 tentativas por segundo (GPU)
      const seconds = Math.pow(2, bits) / 1e10;
      if (seconds < 1) return "instantânea";
      if (seconds < 60) return `${seconds.toFixed(0)} segundos`;
      if (seconds < 3600) return `${(seconds/60).toFixed(0)} minutos`;
      if (seconds < 86400) return `${(seconds/3600).toFixed(0)} horas`;
      if (seconds < 86400*365) return `${(seconds/86400).toFixed(0)} dias`;
      const years = seconds/86400/365;
      if (years < 1e3) return `${years.toFixed(0)} anos`;
      if (years < 1e6) return `${(years/1e3).toFixed(0)} mil anos`;
      if (years < 1e9) return `${(years/1e6).toFixed(0)} milhões de anos`;
      return `bilhões de anos`;
    }
    function escapeAttr(s) { return s.replace(/"/g,'&quot;'); }
    render();
  }
  return { mount };
})();

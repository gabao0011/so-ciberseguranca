/* Cifra de César interativa */
window.CaesarGame = (function () {
  function mount(root) {
    let text = "Os sistemas operacionais gerenciam o hardware.";
    let shift = 3;

    function caesar(str, n) {
      const s = ((n % 26) + 26) % 26;
      return str.replace(/[A-Za-z]/g, c => {
        const base = c <= "Z" ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
      });
    }

    function render() {
      const cipher = caesar(text, shift);
      const back = caesar(cipher, -shift);
      root.innerHTML = `
        <h3>Cifra de César</h3>
        <p>Desloca cada letra do alfabeto em <strong>N</strong> posições. Com César famoso usando deslocamento 3.</p>
        <div class="game-controls">
          <label>Texto:
            <input type="text" data-text value="${escapeAttr(text)}" style="width:320px">
          </label>
          <label>Deslocamento (N):
            <input type="number" min="-25" max="25" value="${shift}" data-shift>
          </label>
        </div>
        <p><strong>Cifrado:</strong> <code style="font-size:1.05rem">${escapeHtml(cipher)}</code></p>
        <p class="muted">(Decifrando de novo com -N: <code>${escapeHtml(back)}</code>)</p>
        <details>
          <summary style="cursor:pointer">💡 Desafio: decifre essa mensagem</summary>
          <p style="margin-top:10px">Zh dwdfdprv dr dpdqkhfhu — vrx d fliud gh Fhvdu. <br>
          <em>Dica: o deslocamento é 3. Cole no campo acima e tente decifrar colocando -3.</em></p>
        </details>
      `;
      root.querySelector("[data-text]").addEventListener("input", e => { text = e.target.value; render(); root.querySelector("[data-text]").focus(); });
      root.querySelector("[data-shift]").addEventListener("input", e => { shift = +e.target.value || 0; render(); root.querySelector("[data-shift]").focus(); });
    }
    function escapeHtml(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
    function escapeAttr(s){return s.replace(/"/g,'&quot;');}
    render();
  }
  return { mount };
})();

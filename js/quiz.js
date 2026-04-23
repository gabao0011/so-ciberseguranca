/* Generic quiz engine.
   Usage:
     <div class="quiz" data-quiz></div>
     <script>Quiz.render(container, questions, options)</script>
   Where `questions` is an array of:
     { q: "pergunta", options: ["a","b","c"], correct: 1, explain: "explicação" }
*/
window.Quiz = (function () {
  function render(container, questions, opts = {}) {
    const state = { answers: Array(questions.length).fill(null), revealed: false };

    const title = opts.title || "Exercício rápido";
    let html = `<h3>${title}</h3>`;
    questions.forEach((q, i) => {
      html += `
        <div class="quiz-q" data-i="${i}">
          <p class="q">${i + 1}. ${q.q}</p>
          <div class="quiz-options">
            ${q.options
              .map(
                (opt, j) =>
                  `<div class="quiz-opt" data-q="${i}" data-opt="${j}">${String.fromCharCode(
                    97 + j
                  )}) ${opt}</div>`
              )
              .join("")}
          </div>
          <div class="quiz-feedback" data-fb="${i}" hidden></div>
        </div>
      `;
    });
    html += `
      <div class="row" style="justify-content:space-between; align-items:center;">
        <button class="btn primary" data-submit>Verificar respostas</button>
        <button class="btn ghost" data-reset>Reiniciar</button>
      </div>
      <div class="quiz-result" data-result hidden></div>
    `;
    container.innerHTML = html;

    container.querySelectorAll(".quiz-opt").forEach((el) => {
      el.addEventListener("click", () => {
        if (state.revealed) return;
        const qi = +el.dataset.q;
        const oi = +el.dataset.opt;
        state.answers[qi] = oi;
        container
          .querySelectorAll(`.quiz-opt[data-q="${qi}"]`)
          .forEach((s) => s.classList.remove("selected"));
        el.classList.add("selected");
      });
    });

    const submitBtn = container.querySelector("[data-submit]");
    const resetBtn = container.querySelector("[data-reset]");
    const resultEl = container.querySelector("[data-result]");

    submitBtn.addEventListener("click", () => {
      let correct = 0;
      questions.forEach((q, i) => {
        const ans = state.answers[i];
        const opts = container.querySelectorAll(`.quiz-opt[data-q="${i}"]`);
        opts.forEach((o) => o.classList.remove("correct", "wrong"));
        opts[q.correct].classList.add("correct");
        if (ans === q.correct) correct++;
        else if (ans !== null) opts[ans].classList.add("wrong");

        const fb = container.querySelector(`[data-fb="${i}"]`);
        if (fb && q.explain) {
          fb.hidden = false;
          fb.innerHTML = `<strong>Explicação:</strong> ${q.explain}`;
        }
      });
      state.revealed = true;
      const pct = Math.round((correct / questions.length) * 100);
      resultEl.hidden = false;
      resultEl.textContent = `Você acertou ${correct} de ${questions.length} (${pct}%).`;
      resultEl.classList.remove("ok", "mid", "bad");
      resultEl.classList.add(pct >= 70 ? "ok" : pct >= 40 ? "mid" : "bad");
    });

    resetBtn.addEventListener("click", () => render(container, questions, opts));
  }

  return { render };
})();

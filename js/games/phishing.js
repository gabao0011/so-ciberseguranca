/* Phishing radar: classificar e-mails como phishing ou legítimos */
window.PhishingGame = (function () {
  const EMAILS = [
    {
      from: "atendimento@suportes-banc0brasil.com",
      subject: "Urgente: sua conta sera bloqueada em 24h",
      body: "Detectamos acesso suspeito. Clique em http://bancobrasiI-seguro.net/reativar para não perder seu cartão. Se não agir hoje sua conta sera cancelada!",
      phishing: true,
      reasons: ["Domínio com '0' no lugar do 'o'", "Tom de urgência e ameaça", "Pede clique em link externo", "Erros de acentuação", "Link com 'I' maiúsculo no lugar de 'l'"]
    },
    {
      from: "no-reply@github.com",
      subject: "[GitHub] New sign-in from Chrome on Windows",
      body: "Percebemos um novo login na sua conta a partir de São Paulo. Se foi você, nenhuma ação é necessária. Se não reconhece, acesse github.com/settings/security diretamente.",
      phishing: false,
      reasons: ["Domínio correto (github.com)", "Não exige clique em link suspeito", "Orienta acessar o site manualmente"]
    },
    {
      from: "rh@empresa.com.br",
      subject: "Sua folha de pagamento — abra o arquivo anexo",
      body: "Segue em anexo (holerite.exe) o seu holerite deste mês. Abra o arquivo para visualizar.",
      phishing: true,
      reasons: ["Anexo .exe — documento jamais é executável", "Holerite em formato estranho (não é .pdf)"]
    },
    {
      from: "suporte@whatsapp.com",
      subject: "Seu código de verificação",
      body: "Seu código é 483-291. Não compartilhe com ninguém. Este código é válido por 5 minutos.",
      phishing: false,
      reasons: ["Domínio correto", "Não pede que você envie o código de volta"]
    },
    {
      from: "premiacao@netflix-premios.com",
      subject: "🎉 Você foi sorteado! Ganhe 1 ano de Netflix grátis",
      body: "Parabéns! Você foi sorteado em nossa promoção. Confirme seus dados bancários no link a seguir para receber: https://bit.ly/3xk9n2q",
      phishing: true,
      reasons: ["Promessa boa demais", "Domínio falso (netflix-premios)", "Pede dados bancários", "Link encurtado (bit.ly) para esconder o destino"]
    },
    {
      from: "billing@spotify.com",
      subject: "Sua fatura de dezembro",
      body: "Olá! Segue o resumo da sua cobrança de R$ 21,90. Você pode ver seus detalhes entrando em sua conta Spotify pelo app.",
      phishing: false,
      reasons: ["Domínio correto", "Sem links obrigatórios", "Instrui acessar o app oficial"]
    },
    {
      from: "diretor@escola.edu.br",
      subject: "Transferir pagamento urgente",
      body: "Oi, estou em reunião e preciso que você transfira R$ 1.200,00 para a conta abaixo. Resolvo quando voltar. Não me ligue, estou no celular emprestado.",
      phishing: true,
      reasons: ["Tenta se passar por autoridade (whaling/pretexting)", "Urgência e isolamento (pede pra não ligar)", "Pede transferência sem confirmar por outro canal"]
    },
    {
      from: "contato@receita.fazenda.gov.br",
      subject: "Irregularidade no seu CPF",
      body: "Foi detectada uma pendência. Regularize em https://receita.fazenda.gov.br/autoatendimento — exige login com certificado digital ou gov.br.",
      phishing: false,
      reasons: ["Domínio oficial (.gov.br)", "Não pede senha por e-mail", "Procedimento coerente"]
    },
    {
      from: "suporte@instagrarn.com",
      subject: "Sua conta foi denunciada — recurso em 24h",
      body: "Sua conta pode ser removida por violação de direitos autorais. Preencha o formulário de recurso: http://instagrarn-recurso.com/form",
      phishing: true,
      reasons: ["'Instagrarn' com 'rn' em vez de 'm'", "Pressão + link externo", "Domínio do link é outro ainda"]
    },
    {
      from: "atualizacoes@microsoft.com",
      subject: "Atualização cumulativa KB5034441 disponível",
      body: "A atualização será instalada automaticamente via Windows Update. Você pode ler os detalhes no site oficial.",
      phishing: false,
      reasons: ["Domínio correto", "Não pede ação crítica pelo e-mail"]
    }
  ];

  function mount(root) {
    const order = [...EMAILS].sort(() => Math.random() - 0.5);
    let idx = 0, score = 0, revealed = false;

    function render() {
      if (idx >= order.length) {
        const pct = Math.round((score / order.length) * 100);
        const cls = pct >= 80 ? "ok" : pct >= 50 ? "mid" : "bad";
        root.innerHTML = `
          <h3>Radar antiphishing</h3>
          <div class="quiz-result ${cls}">
            Você acertou ${score} de ${order.length} (${pct}%).
          </div>
          <button class="btn primary" data-restart>Jogar de novo</button>
        `;
        root.querySelector("[data-restart]").addEventListener("click", () => mount(root));
        return;
      }
      const e = order[idx];
      root.innerHTML = `
        <h3>Radar antiphishing — ${idx+1}/${order.length}</h3>
        <p class="muted">Classifique o e-mail abaixo.</p>
        <div class="email-mock">
          <div class="from">De: ${escapeHtml(e.from)}</div>
          <div class="subject">Assunto: ${escapeHtml(e.subject)}</div>
          <div class="body">${escapeHtml(e.body)}</div>
        </div>
        <div class="row">
          <button class="btn ok" data-ans="false" ${revealed?'disabled':''}>Legítimo</button>
          <button class="btn cyber" data-ans="true" ${revealed?'disabled':''}>Phishing</button>
        </div>
        <div data-feedback style="margin-top:12px"></div>
        <div class="row" data-nextrow style="margin-top:12px; display:none;">
          <button class="btn primary" data-next>Próximo →</button>
        </div>
        <p class="muted mt-2">Placar: ${score}/${idx}</p>
      `;
      root.querySelectorAll("[data-ans]").forEach(b => {
        b.addEventListener("click", () => {
          const ans = b.dataset.ans === "true";
          revealed = true;
          if (ans === e.phishing) score++;
          const fb = root.querySelector("[data-feedback]");
          const ok = ans === e.phishing;
          fb.innerHTML = `
            <div class="callout ${ok?'ok':'danger'}">
              <strong>${ok ? 'Boa!' : 'Eita!'}</strong>
              ${e.phishing ? 'Era phishing.' : 'Era legítimo.'}<br>
              <em>Pistas:</em> ${e.reasons.map(r=>'• '+escapeHtml(r)).join('<br>')}
            </div>
          `;
          root.querySelector("[data-nextrow]").style.display = "flex";
          root.querySelectorAll("[data-ans]").forEach(x => x.disabled = true);
          root.querySelector("[data-next]").addEventListener("click", () => {
            idx++; revealed = false; render();
          });
        });
      });
    }
    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    }
    render();
  }
  return { mount };
})();

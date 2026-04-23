/* Shared layout: injects header, sidebar menu (for lessons), footer and breadcrumb.
   Relies on data-section and data-page attributes on <body>. */

(function () {
  const ROUTES = {
    so: {
      label: "Sistemas Operacionais",
      index: "so.html",
      color: "so",
      pages: [
        { id: "introducao",    file: "so-introducao.html",    title: "1. Introdução aos S.O." },
        { id: "historia",      file: "so-historia.html",      title: "2. História e evolução" },
        { id: "tipos",         file: "so-tipos.html",         title: "3. Tipos de S.O." },
        { id: "processos",     file: "so-processos.html",     title: "4. Processos e Threads" },
        { id: "escalonamento", file: "so-escalonamento.html", title: "5. Escalonamento de CPU" },
        { id: "memoria",       file: "so-memoria.html",       title: "6. Gerência de memória" },
        { id: "arquivos",      file: "so-arquivos.html",      title: "7. Sistema de arquivos" },
        { id: "deadlocks",     file: "so-deadlocks.html",     title: "8. Deadlocks e concorrência" },
        { id: "es",            file: "so-es.html",            title: "9. Entrada e Saída (E/S)" },
        { id: "virtualizacao", file: "so-virtualizacao.html", title: "10. Virtualização e Nuvem" },
        { id: "quiz",          file: "so-quiz.html",          title: "Quiz final de S.O." },
      ],
    },
    cyber: {
      label: "Cibersegurança",
      index: "cyber.html",
      color: "cyber",
      pages: [
        { id: "introducao",     file: "cyber-introducao.html",    title: "1. O que é Cibersegurança" },
        { id: "cia",            file: "cyber-cia.html",           title: "2. Tríade CIA e princípios" },
        { id: "ameacas",        file: "cyber-ameacas.html",       title: "3. Tipos de ameaças" },
        { id: "malware",        file: "cyber-malware.html",       title: "4. Malware" },
        { id: "engenharia",     file: "cyber-engenharia.html",    title: "5. Engenharia social" },
        { id: "senhas",         file: "cyber-senhas.html",        title: "6. Senhas e autenticação" },
        { id: "criptografia",   file: "cyber-criptografia.html",  title: "7. Criptografia" },
        { id: "redes",          file: "cyber-redes.html",         title: "8. Redes e firewall" },
        { id: "web",            file: "cyber-web.html",           title: "9. Segurança Web e mobile" },
        { id: "lgpd",           file: "cyber-lgpd.html",          title: "10. Privacidade e LGPD" },
        { id: "boas-praticas",  file: "cyber-boas-praticas.html", title: "11. Boas práticas e hábitos" },
        { id: "carreira",       file: "cyber-carreira.html",      title: "12. Carreira em Cyber" },
        { id: "quiz",           file: "cyber-quiz.html",          title: "Quiz final de Cyber" },
      ],
    },
  };

  const body = document.body;
  const section = body.dataset.section || "";
  const pageId = body.dataset.page || "";

  // ---- Header ----
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">
        <span class="brand-logo">&#x2699;</span>
        <span>S.O. &amp; Cyber<span style="color:var(--muted); font-weight:500; margin-left:6px;">1° DEV</span></span>
      </a>
      <button class="menu-toggle" aria-label="Abrir menu">&#9776; Menu</button>
      <nav class="nav">
        <a href="index.html" data-nav="home">Início</a>
        <a href="so.html" data-nav="so">Sistemas Operacionais</a>
        <a href="cyber.html" data-nav="cyber">Cibersegurança</a>
        <a href="minigames.html" data-nav="minigames">Minigames</a>
        <a href="glossario.html" data-nav="glossario">Glossário</a>
      </nav>
    </div>
  `;
  body.insertBefore(header, body.firstChild);

  // Set active nav
  const navActive = body.dataset.nav || section || "home";
  header.querySelectorAll(".nav a").forEach((a) => {
    if (a.dataset.nav === navActive) a.classList.add("active");
  });

  // Mobile menu
  const toggle = header.querySelector(".menu-toggle");
  const navEl = header.querySelector(".nav");
  toggle.addEventListener("click", () => navEl.classList.toggle("open"));

  // ---- Sidebar (only for lesson pages) ----
  const layout = document.querySelector(".lesson-layout");
  if (layout && ROUTES[section]) {
    const route = ROUTES[section];
    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.innerHTML = `
      <h4>${route.label}</h4>
      <ul>
        <li><a href="${route.index}">← Visão geral</a></li>
        ${route.pages.map(p => `<li><a href="${p.file}" data-id="${p.id}">${p.title}</a></li>`).join("")}
      </ul>
      <h4>Extras</h4>
      <ul>
        <li><a href="minigames.html">Minigames</a></li>
        <li><a href="glossario.html">Glossário</a></li>
      </ul>
    `;
    layout.insertBefore(sidebar, layout.firstChild);

    sidebar.querySelectorAll("a").forEach((a) => {
      if (a.dataset.id === pageId) a.classList.add("active");
    });

    // Prev / Next pager (append inside article if present)
    const article = layout.querySelector("article.lesson");
    if (article && pageId) {
      const pages = route.pages;
      const idx = pages.findIndex((p) => p.id === pageId);
      if (idx !== -1) {
        const prev = idx > 0 ? pages[idx - 1] : null;
        const next = idx < pages.length - 1 ? pages[idx + 1] : null;
        const pager = document.createElement("div");
        pager.className = "pager";
        pager.innerHTML = `
          ${prev ? `<a href="${prev.file}"><small>← Anterior</small>${prev.title}</a>` : `<span></span>`}
          ${next ? `<a href="${next.file}" class="next"><small>Próximo →</small>${next.title}</a>` : `<span></span>`}
        `;
        article.appendChild(pager);
      }
    }
  }

  // ---- Footer ----
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      Feito com <span style="color:var(--cyber)">♥</span> para estudantes do 1º DEV —
      Sistemas Operacionais &amp; Cibersegurança. <br />
      <small class="muted">Conteúdo didático — uso pedagógico.</small>
    </div>
  `;
  body.appendChild(footer);
})();

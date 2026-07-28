(() => {
  "use strict";

  const config = window.RENATA_CONFIG || {};
  const placeholders = [
    "COLE_AQUI_O_LINK_OFICIAL_DOS_IMOVEIS",
    "COLE_AQUI_O_EMAIL_OFICIAL",
    "COLE_AQUI_O_LINK_COMPLETO_DO_INSTAGRAM",
    "5583999999999"
  ];

  const isPlaceholder = (value) =>
    !value || placeholders.some((placeholder) => String(value).includes(placeholder));

  const normalizeExternalUrl = (value) => {
    const text = String(value || "").trim();
    if (!text) return "";
    return /^https?:\/\//i.test(text) ? text : `https://${text}`;
  };

  const setLink = (name, href) => {
    const element = document.querySelector(`[data-link="${name}"]`);
    if (!element) return;

    if (!href || isPlaceholder(href)) {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        alert(`O link de ${name} ainda precisa ser configurado em app-config.js.`);
      });
      return;
    }

    element.href = href;
  };

  setLink("imoveis", normalizeExternalUrl(config.imoveis));

  if (!isPlaceholder(config.whatsappNumero)) {
    const numero = String(config.whatsappNumero).replace(/\D/g, "");
    const mensagem = encodeURIComponent(config.whatsappMensagem || "");
    setLink("whatsapp", `https://wa.me/${numero}${mensagem ? `?text=${mensagem}` : ""}`);
  } else {
    setLink("whatsapp", "");
  }

  if (!isPlaceholder(config.email)) {
    const assunto = encodeURIComponent(config.emailAssunto || "");
    setLink("email", `mailto:${String(config.email).trim()}${assunto ? `?subject=${assunto}` : ""}`);
  } else {
    setLink("email", "");
  }

  setLink("instagram", normalizeExternalUrl(config.instagram));

  // Registro do PWA
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.error("Falha ao registrar o service worker:", error);
      });
    });
  }

  // Botão nativo de instalação, mostrado apenas quando o navegador permite.
  let installPrompt = null;
  const installButton = document.getElementById("installApp");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  installButton?.addEventListener("click", async () => {
    if (!installPrompt) return;
    installButton.hidden = true;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
  });

  window.addEventListener("appinstalled", () => {
    if (installButton) installButton.hidden = true;
    installPrompt = null;
  });
})();

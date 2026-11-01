/* global document, navigator, window */
const copyButton = document.querySelector("[data-copy]");

copyButton?.addEventListener("click", async () => {
  const commands = copyButton.getAttribute("data-copy");
  const hasCommands = commands !== null;

  if (!hasCommands) return;

  try {
    await navigator.clipboard.writeText(commands);
    copyButton.textContent = "Copiado!";
    window.setTimeout(() => {
      copyButton.textContent = "Copiar";
    }, 2200);
  } catch {
    copyButton.textContent = "Selecione o texto";
  }
});

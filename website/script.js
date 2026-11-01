/* global document, navigator, window */
const documentationDialog = document.querySelector("[data-doc-dialog]");
const documentationPanels = document.querySelectorAll("[data-doc-panel]");
const documentationOpeners = document.querySelectorAll("[data-doc-open]");
const documentationTabs = document.querySelectorAll(
  ".drawer-nav [data-doc-open]",
);
const documentationClosers = document.querySelectorAll("[data-doc-close]");
const documentationBody = document.querySelector(".drawer-body");
const copyButtons = document.querySelectorAll("[data-copy]");
const hasDocumentationDialog = documentationDialog !== null;

if (hasDocumentationDialog) {
  for (const opener of documentationOpeners) {
    opener.addEventListener("click", () => {
      const requestedSection = opener.getAttribute("data-doc-open");

      for (const panel of documentationPanels) {
        const panelIsRequested =
          panel.getAttribute("data-doc-panel") === requestedSection;
        panel.hidden = !panelIsRequested;
      }

      for (const tab of documentationTabs) {
        const tabIsRequested =
          tab.getAttribute("data-doc-open") === requestedSection;
        tab.setAttribute("aria-current", tabIsRequested ? "page" : "false");
      }

      const hasDocumentationBody = documentationBody !== null;

      if (hasDocumentationBody) documentationBody.scrollTop = 0;

      const dialogIsClosed = !documentationDialog.open;

      if (dialogIsClosed) documentationDialog.showModal();
    });
  }

  for (const closer of documentationClosers) {
    closer.addEventListener("click", () => documentationDialog.close());
  }

  documentationDialog.addEventListener("click", (event) => {
    const backdropWasClicked = event.target === documentationDialog;

    if (backdropWasClicked) documentationDialog.close();
  });
}

for (const copyButton of copyButtons) {
  copyButton.addEventListener("click", async () => {
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
}

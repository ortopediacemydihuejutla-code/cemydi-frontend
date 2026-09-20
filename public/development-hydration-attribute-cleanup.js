(() => {
  const extensionAttributes = [
    "bis_skin_checked",
    "data-mbtss-nonce",
    "data-lt-installed",
  ];

  const cleanElement = (element) => {
    if (!(element instanceof Element)) return;

    for (const attr of extensionAttributes) {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
      element.querySelectorAll(`[${attr}]`).forEach((child) => {
        child.removeAttribute(attr);
      });
    }
  };

  cleanElement(document.documentElement);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        cleanElement(record.target);
        continue;
      }

      record.addedNodes.forEach((node) => cleanElement(node));
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: extensionAttributes,
    childList: true,
    subtree: true,
  });

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      cleanElement(document.documentElement);
      observer.disconnect();
    },
    { once: true },
  );
})();

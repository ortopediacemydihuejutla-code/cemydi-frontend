(() => {
  const attributeName = "bis_skin_checked";

  const cleanElement = (element) => {
    if (!(element instanceof Element)) return;

    element.removeAttribute(attributeName);
    element.querySelectorAll(`[${attributeName}]`).forEach((child) => {
      child.removeAttribute(attributeName);
    });
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
    attributeFilter: [attributeName],
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

// Immediately invoke to avoid polluting globals
(function () {
  const processed = new WeakSet();

  // Attach copy buttons overlay to an <img>
  function addCopyButtons(img) {
    if (processed.has(img)) return;
    processed.add(img);

    // Wrap image to allow absolute positioning
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // Container for buttons
    const btnContainer = document.createElement("div");
    Object.assign(btnContainer.style, {
      position: "absolute",
      top: "4px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "4px",
      opacity: "0",
      transition: "opacity 0.2s ease-in-out",
    });
    wrapper.appendChild(btnContainer);

    // Image copy button
    const imgBtn = document.createElement("button");
    imgBtn.innerText = "📋 Copy Image";
    Object.assign(imgBtn.style, getButtonStyle());
    btnContainer.appendChild(imgBtn);

    // Show on hover
    wrapper.addEventListener(
      "mouseenter",
      () => (btnContainer.style.opacity = "1")
    );
    wrapper.addEventListener(
      "mouseleave",
      () => (btnContainer.style.opacity = "0")
    );

    // Click handlers
    imgBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        const resp = await fetch(img.src);
        const blob = await resp.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        flashButton(imgBtn, "✅ Copied");
      } catch (err) {
        console.error("Image copy failed", err);
        flashButton(imgBtn, "❌ Failed");
      }
    });
  }

  function getButtonStyle() {
    return {
      padding: "4px",
      background: "rgba(255,255,255,0.9)",
      border: "1px solid #ccc",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      lineHeight: "1",
    };
  }

  function flashButton(button, symbol) {
    const old = button.innerText;
    button.innerText = symbol;
    setTimeout(() => (button.innerText = old), 1000);
  }

  // Process existing images
  document.querySelectorAll("img").forEach(addCopyButtons);

  // Observe for new images (Notion loads dynamically)
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.tagName === "IMG") addCopyButtons(node);
        else if (node.querySelectorAll)
          node.querySelectorAll("img").forEach(addCopyButtons);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

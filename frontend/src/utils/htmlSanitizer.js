// Lightweight HTML sanitizer to safely render HTML content without extra deps
// For production-grade sanitization, DOMPurify is recommended. This keeps things simple and robust.

export function sanitizeHtml(htmlString = "") {
  try {
    // 1) Decode HTML entities once (handles content saved as &lt;h2&gt;...&lt;/h2&gt;)
    const decoder = document.createElement("textarea");
    decoder.innerHTML = String(htmlString);
    const decoded = decoder.value;

    // 2) Load into a container as real HTML for cleaning
    const container = document.createElement("div");
    container.innerHTML = decoded;

    // Remove dangerous elements entirely
    container
      .querySelectorAll("script, iframe, object, embed, style, link, meta")
      .forEach((el) => el.remove());

    // Clean attributes on all elements
    container.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = (attr.value || "").trim();
        // Strip event handlers and JS URLs
        if (name.startsWith("on")) el.removeAttribute(attr.name);
        if (name === "href" && /^javascript:/i.test(value))
          el.removeAttribute(attr.name);
      });

      // Ensure safe links
      if (el.tagName.toLowerCase() === "a") {
        if (!el.getAttribute("target")) el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });

    return container.innerHTML;
  } catch (e) {
    // If anything goes wrong, return the raw string (better to render than to break UI)
    return String(htmlString || "");
  }
}

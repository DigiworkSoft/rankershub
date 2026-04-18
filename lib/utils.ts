import sanitizeHtml from "sanitize-html";

/**
 * Helper to get the correct image URL.
 * Defaults to local storage (/uploads/) if a simple filename is provided.
 */
export function getImageUrl(image: string | null | undefined): string {
  if (!image) {
    // Return a high-quality placeholder if no image exists
    return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800";
  }

  // If it's a full URL (YouTube, Unsplash, etc.), return as is
  if (image.startsWith("http")) {
    return image;
  }

  // If DB already stores an absolute local path like /uploads/file.jpg, keep it.
  if (image.startsWith("/")) {
    return image;
  }

  // Otherwise, assume it's a local filename in public/uploads
  return `/uploads/${image}`;
}

export function formatBlogContentToHtml(content: string | null | undefined): string {
  if (!content) return "";

  const decodedContent = decodeBasicHtmlEntities(content);
  const normalizedContent = normalizeHeadingTags(decodedContent);

  return sanitizeHtml(normalizedContent, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
      "u",
      "s",
      "iframe",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "style"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\((\d{1,3}\s*,\s*){2}\d{1,3}\)$/, /^hsl\(.+\)$/i],
        "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\((\d{1,3}\s*,\s*){2}\d{1,3}\)$/, /^hsl\(.+\)$/i],
        "font-weight": [/^(normal|bold|bolder|lighter|[1-9]00)$/],
        "font-style": [/^(normal|italic|oblique)$/],
        "text-decoration": [/^(none|underline|line-through|overline)$/],
        "text-align": [/^(left|right|center|justify)$/],
        "font-size": [/^(\d+(\.\d+)?(px|rem|em|%)|xx-small|x-small|small|medium|large|x-large|xx-large)$/i],
        "font-family": [
          /^(inter|outfit|arial|helvetica|georgia|times new roman|courier new|monospace|serif|sans-serif)(\s*,\s*(inter|outfit|arial|helvetica|georgia|times new roman|courier new|monospace|serif|sans-serif))*$/i,
          /^"(inter|outfit|arial|helvetica|georgia|times new roman|courier new|monospace|serif|sans-serif)"(\s*,\s*"(inter|outfit|arial|helvetica|georgia|times new roman|courier new|monospace|serif|sans-serif)")*$/i,
        ],
        "line-height": [/^(normal|\d+(\.\d+)?|\d+(\.\d+)?(px|rem|em|%)?)$/i],
        margin: [/^\d+(\.\d+)?(px|rem|em|%)?(\s+\d+(\.\d+)?(px|rem|em|%)?){0,3}$/i, /^0$/],
        padding: [/^\d+(\.\d+)?(px|rem|em|%)?(\s+\d+(\.\d+)?(px|rem|em|%)?){0,3}$/i, /^0$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

function normalizeHeadingTags(input: string): string {
  return input
    .replace(/<h([7-9])(\b[^>]*)>/gi, "<h6$2>")
    .replace(/<\/h([7-9])>/gi, "</h6>");
}

function decodeBasicHtmlEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveSafeColor(color: string): string {
  const palette: Record<string, string> = {
    red: "#dc2626",
    blue: "#2563eb",
    green: "#16a34a",
    orange: "#ea580c",
    purple: "#9333ea",
    teal: "#0d9488",
    indigo: "#4f46e5",
    gray: "#4b5563",
    pink: "#db2777",
  };

  if (palette[color.toLowerCase()]) return palette[color.toLowerCase()];
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return color;
  return "#4f46e5";
}

export function formatInlineText(input: string): string {
  let text = escapeHtml(input);

  text = text.replace(/\[color:([^\]]+)\]([\s\S]*?)\[\/color\]/g, (_m, color, content) => {
    const safeColor = resolveSafeColor(String(color));
    return `<span style="color:${safeColor};font-weight:600;">${content}</span>`;
  });

  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, label, href) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold underline underline-offset-4">${label}</a>`;
  });

  return text;
}

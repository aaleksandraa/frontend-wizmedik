export function stripGoogleFontImports(html: string): string {
  if (!html) {
    return html;
  }

  return html
    .replace(/@import\s+url\((['"]?)https:\/\/fonts\.googleapis\.com\/css2[^)]*\)\s*;\s*/gi, "")
    .replace(/<link[^>]+href=(['"])https:\/\/fonts\.googleapis\.com\/css2[^'"]+\1[^>]*>/gi, "");
}

function isCleanSlug(slug: string | undefined | null): boolean {
  if (!slug) return false;
  return /^[a-z0-9-]+$/.test(slug);
}

function ensureSlug(event: any) {
  if (!isCleanSlug(event.params.data.slug)) {
    event.params.data.slug = `article-${Date.now()}`;
  }
}

export default {
  beforeCreate: ensureSlug,
  beforeUpdate: ensureSlug,
};

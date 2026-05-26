function ensureSlug(event: any) {
  if (!event.params.data.slug) {
    event.params.data.slug = `article-${Date.now()}`;
  }
}

export default {
  beforeCreate: ensureSlug,
  beforeUpdate: ensureSlug,
};

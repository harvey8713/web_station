export default {
  beforeCreate(event: any) {
    if (!event.params.data.slug) {
      event.params.data.slug = `article-${Date.now()}`;
    }
  },
};

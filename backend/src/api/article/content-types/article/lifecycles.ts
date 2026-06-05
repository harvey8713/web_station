export default {
  beforeCreate(event: any) {
    if (!event.params.data.slug || !/^[a-z0-9-]+$/.test(event.params.data.slug)) {
      event.params.data.slug = `article-${Date.now()}`;
    }
  },
  beforeUpdate(event: any) {
    const slug = event.params.data.slug;
    // 只在 slug 明确被传入且是脏值时才覆盖，不干扰正常更新
    if (slug !== undefined && (!/^[a-z0-9-]+$/.test(slug))) {
      event.params.data.slug = `article-${Date.now()}`;
    }
  },
};

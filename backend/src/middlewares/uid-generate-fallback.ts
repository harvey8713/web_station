export default () => async (ctx: any, next: any) => {
  await next();

  if (
    ctx.method === 'POST' &&
    ctx.path === '/content-manager/uid/generate' &&
    ctx.request.body?.contentTypeUID === 'api::article.article' &&
    ctx.request.body?.field === 'slug'
  ) {
    const generated = ctx.body?.data;
    if (!generated || !/^[a-z0-9-]+$/.test(generated)) {
      ctx.body = { data: `article-${Date.now()}` };
    }
  }
};

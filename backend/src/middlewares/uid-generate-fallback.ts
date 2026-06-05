// slug 字段已改为 string 类型，uid 自动生成逻辑由 lifecycles.ts 接管，此 middleware 保留为空
export default () => async (_ctx: any, next: any) => {
  await next();
};

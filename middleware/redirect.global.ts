export default defineNuxtRouteMiddleware(
  // eslint `consistent-return` conflicts with `no-useless-return` here
  // eslint-disable-next-line consistent-return
  async (to) => {
    if (!to.path.match(/^\/[^\/]+\/[^\/]+/)) {
      return await navigateTo('/seed.radicle.xyz:443/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5')
    }
  },
)

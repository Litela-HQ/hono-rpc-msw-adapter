export const concatUrl = (baseUrl: string, route: string) => {
  try {
    return new URL(route, baseUrl).href;
  } catch {
    const dummyBase = 'http://localhost:6789';
    return new URL(baseUrl === '/' ? route : baseUrl + route, dummyBase).href.replace(
      dummyBase,
      '',
    );
  }
};

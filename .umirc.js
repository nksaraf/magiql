export default {
  // configuration items
  favicon: "/favicon.ico",
  logo: "/hat2.png",
  outputPath: "/dist/docs",
  mode: 'doc',
  exportStatic: {},
  menus: {
    '/api': [
      {
        title: 'API',
        children: ['/api/useQuery'],
      },
    ]
  }
};

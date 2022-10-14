let baseURL = (env => {
  switch (env) {
    case 'development': return 'http://localhost:8009/'
    case 'testing': return 'https://qbwc.thebullittgroup.com/test/ysg/'
    case 'production': return 'https://qbwc.thebullittgroup.com/ysg/'
  }
})(process.env.NODE_ENV)

console.log(`\n\nRunning in ${process.env.NODE_ENV.toUpperCase()} mode.`)
console.log(`Default Server URL: ${baseURL}\n`)

const ALLOWED_ORIGINS = ['http://localhost:3000','https://starla.thebullittgroup.com']

export default {
  env: {
    NODE_ENV: process.env.NODE_ENV
  },
  ssr: true,
  /*
  ** Headers of the page
  */
  target: 'static',
  head: {
    title: 'Starla | The Bullitt Group',
    titleTemplate: '%s | Starla | The Bullitt Group',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/persistedState.client.js' },
    { src: '~/plugins/datepicker.client.js' },
    { src: '~/plugins/bus.js' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    'nuxt-socket-io'
  ],
  io: {
    sockets: [
      {
        name: 'tracker',
        url: process.env.NODE_ENV == 'development' && 'ws://localhost:8013' || 'https://tracker-server.thebullittgroup.com',
        //url:'https://mgmt-server.thebullittgroup.com',
        server: {
          cors: {
            origin: ALLOWED_ORIGINS
          }
        },
        path: '/ws/'
      },
      {
        name: 'payroll-YORK',
        url: process.env.NODE_ENV == 'development' && 'ws://localhost:8012' || 'https://york.payroll-server.thebullittgroup.com',
        //url:'https://mgmt-server.thebullittgroup.com',
        server: {
          cors: {
            origin: ALLOWED_ORIGINS
          }
        },
        path: '/ws/'    
      },
      {
        name: 'payroll-QAJAQ',
        url: process.env.NODE_ENV == 'development' && 'ws://localhost:8014' || 'https://qajaq.payroll-server.thebullittgroup.com',
        //url:'https://mgmt-server.thebullittgroup.com',
        server: {
          cors: {
            origin: ALLOWED_ORIGINS
          }
        },
        path: '/ws/'    
      }
    ]
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: process.env.NODE_ENV == 'development' && 'http://localhost:8011' || 'https://starla-server.thebullittgroup.com'
    //baseURL:'https://mgmt-server.thebullittgroup.com'
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}


export default {
  ssr: true,
  /*
  ** Headers of the page
  */
  target: 'static',
  head: {
    title: 'STARLA | The Bullitt Group',
    titleTemplate: '%s | STARLA | The Bullitt Group',
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
        url: process.env.NODE_ENV == 'development' && 'ws://localhost:8011' || 'https://mgmt-server.thebullittgroup.com',
        //url:'https://mgmt-server.thebullittgroup.com',
        server: {
          cors: {
            origin: ['http://localhost:3000','https://starla.thebullittgroup.com']
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
    baseURL: process.env.NODE_ENV == 'development' && 'http://localhost:8011' || 'https://mgmt-server.thebullittgroup.com'
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

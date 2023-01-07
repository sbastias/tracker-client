const URLS = (env => {
  switch (env) {
    case 'development': return {
      baseURL: 'http://localhost:3333',
      trackerSocketURL: 'ws://localhost:8013',
      payrollSocketURL: 'ws://localhost:8012'
    }
    case 'testing': return {
      baseURL: 'https://payroll.starla.bullittstaffing.com/test',
      trackerSocketURL: 'https://tracker-server.thebullittgroup.com',
      payrollSocketURL: 'https://sockets.starla.bullittstaffing.com'
    }
    case 'production': return {
      baseURL: 'https://payroll.starla.bullittstaffing.com',
      trackerSocketURL: 'https://tracker-server.thebullittgroup.com',
      payrollSocketURL: 'https://sockets.starla.bullittstaffing.com'
    }
  }
})(process.env.SETTINGS || 'production') 

console.log(`\n\nRunning in ${process.env.NODE_ENV.toUpperCase()} environment.`)
console.log(`\n\nRunning in ${process.env.SETTINGS && process.env.SETTINGS.toUpperCase() || 'PRODUCTION'} mode.`)
console.log(`Default Server URL: ${URLS.baseURL}\n`)
console.log(`Payroll Socket Server URL: ${URLS.payrollSocketURL}\n`)
console.log(`Tracker Socket Server URL: ${URLS.trackerSocketURL}\n`)

const ALLOWED_ORIGINS = ['http://localhost:3000','https://starla.thebullittgroup.com','https://starla.bullittstaffing.com']

export default {
  env: {
    NODE_ENV: process.env.NODE_ENV,
    SETTINGS: process.env.SETTINGS
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
        name: 'starla-staff',
        url: URLS.trackerSocketURL,
        //url:'https://mgmt-server.thebullittgroup.com',
        server: {
          cors: {
            origin: ALLOWED_ORIGINS
          }
        },
        path: '/ws/'
      },
      {
        name: 'payroll',
        url: URLS.payrollSocketURL,
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
    baseURL: URLS.baseURL
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

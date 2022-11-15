export const state = () => ({
  accessToken: false,
  email: '',
  permissions: [],
  weekending: false,
  supplier: '',
  user: false,
  firstname: ''
})

export const mutations = {
  STORE_TOKEN: (state, token) => {
    state.accessToken = token
  },
  STORE_PERMISSIONS: (state, permissionsString) => {
    state.permissions = permissionsString.split(';')
  },
  STORE_EMAIL: (state, email) => {
    state.email = email
  },
  STORE_USER: (state, user) => {
    state.user = user
  },
  STORE_WEEKENDING: (state, weekending) => {
    state.weekending = weekending
  },
  STORE_WEEKDAY: (state, weekday) => {
    state.weekday = weekday
  },
  STORE_SUPPLIER: (state, supplier) => {
    state.supplier = supplier
  },
  STORE_FIRSTNAME: (state, firstname) => {
    state.firstname = firstname
  },
  LOGOUT: (state) => {
    state.accessToken = false
    state.email = ''
    state.firstname = ''
    state.permissions = []
    state.weekending = false
    state.weekday = false
    state.supplier = ''
    state.user = false
  }
}

export const actions = {
  //UPDATE_PLACEMENTS
}

export const getters = {
  hasPermissions: (state) => (permission) => state.permissions.indexOf(permission) > -1,
  accessToken: (state) => state.accessToken,
  externalUser: (state) => state.user,
  storedWeekending: (state) => state.weekending,
  storedSupplier: (state) => state.supplier,
}
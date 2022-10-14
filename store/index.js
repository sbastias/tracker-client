export const state = () => ({
  accessToken: false,
  email: '',
  permissions: [],
  weekending: '',
  supplier: ''
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
  STORE_WEEKENDING: (state, weekending) => {
    state.weekending = weekending
  },
  STORE_SUPPLIER: (state, supplier) => {
    state.supplier = supplier
  },
  LOGOUT: (state) => {
    state.accessToken = false
    state.permissions = []
    state.weekending = ''
    state.email = ''
  }
}

export const actions = {
  //UPDATE_PLACEMENTS
}

export const getters = {
  hasPermissions: (state) => (permission) => state.permissions.indexOf(permission) > -1,
  accessToken: (state) => state.accessToken,
  storedWeekending: (state) => state.weekending,
  storedSupplier: (state) => state.supplier,
}
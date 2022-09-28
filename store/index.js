export const state = () => ({
  accessToken: false,
  email: '',
  permissions: []
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
  LOGOUT: (state) => {
    state.accessToken = false
    state.permissions = []
    state.email = ''
  }
}

export const actions = {
  //UPDATE_PLACEMENTS
}

export const getters = {
  hasPermissions: (state) => (permission) => state.permissions.indexOf(permission) > -1
}
export const state = () => ({
  accessToken: false,
  email: ''
})

export const mutations = {
  STORE_TOKEN: (state, token) => {
    state.accessToken = token
  },
  STORE_EMAIL: (state, email) => {
    state.email = email
  },
  LOGOUT: (state) => {
    state.accessToken = false
    state.email = ''
  }
}

export const actions = {
  //UPDATE_PLACEMENTS
}
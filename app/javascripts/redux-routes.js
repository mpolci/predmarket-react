function getRouteAction () {
  return {
    setView: view => ({type: 'SET_VIEW', view})
  }
}

function getRouteReducer () {
  const defaultState = null
  return (state=defaultState, action) => {
    switch (action.type) {
      case 'SET_VIEW':
        if (['create', 'market'].find(x => x === action.view))
          return action.view
        else
          return defaultState
      default:
        return state
    }
  }
}
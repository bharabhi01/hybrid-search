const initialState = {
    searchOptions: []
}

export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SEARCH_OPTIONS':
            return { ...state, searchOptions: action.payload };
        default:
            return state;
    }
}
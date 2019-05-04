import {READING_PROGRESS, SET_BOOKMARK} from "../actions";

const initialState = {
  readingProgress: 0,
};

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
    case READING_PROGRESS:
      return {...state, readingProgress: action.payload};
    case SET_BOOKMARK:
      return {...state, isBookmarked: action.payload};
    default:
      return state
  }
}

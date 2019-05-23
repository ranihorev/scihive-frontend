import {CLEAR_PAPER, READING_PROGRESS, SET_BOOKMARK, SET_DOCUMENT, SET_REFERNCES, SET_SECTIONS} from "../actions";

const initialState = {
  readingProgress: 0,
  isBookmarked: false,
  document: undefined,
  sections: undefined,
  references: {},
};

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
    case CLEAR_PAPER:
      return initialState;
    case READING_PROGRESS:
      return {...state, readingProgress: action.payload};
    case SET_BOOKMARK:
      return {...state, isBookmarked: action.payload};
    case SET_DOCUMENT:
      return {...state, document: action.payload};
    case SET_SECTIONS:
      return {...state, sections: action.payload};
    case SET_REFERNCES:
      return {...state, references: action.payload};
    default:
      return state
  }
}

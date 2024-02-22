import { useReducer } from "react";

const initialState = {
  page: 1,
  rowsPerPage: 10,
  order: "asc",
  orderBy: "",
  selected: [],
  filterList: [],
  searchText: "",
};
const useTable = () => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "CHANGE_PAGE_AND_ROWS_PER_PAGE":
        return {
          ...state,
          page: action.payload.page,
          rowsPerPage: action.payload.rowsPerPage,
        };
      case "CHANGE_PAGE":
        return { ...state, page: action.payload };
      case "CHANGE_ROWS_PER_PAGE":
        return { ...state, rowsPerPage: action.payload };
      case "CHANGE_ORDER_BY":
        return { ...state, orderBy: action.payload };
      case "CHANGE_ORDER":
        return { ...state, order: action.payload };
      case "CHANGE_SELECTED":
        return { ...state, selected: action.payload };
      case "CHANGE_FILTER_LIST":
        return { ...state, filterList: action.payload };
      case "CHANGE_SEARCH_TEXT":
        return { ...state, searchText: action.payload };
      default:
        return state;
    }
  }, initialState);
  return [state, dispatch];
};

export default useTable;

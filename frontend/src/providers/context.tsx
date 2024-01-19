// React
import { createContext, useLayoutEffect, useContext, useReducer } from "react";
// Services
import axios from "../services/axios";
// Constants, Helpers & Types
import { ActionType } from "../utils/types/enum";
import {
  Action,
  DispatchCreator,
  PostType,
  Store,
  UserType,
} from "../utils/types";

// default store
const store: Store = {
  authenticating: false,
  posts: [],
};

// store context
const StoreContext = createContext<Store>(store);
// dispatch context
const DispatchContext = createContext<DispatchCreator>(() => undefined);

// store reducer from managing store state
const reducer = (state: Store, { type, payload }: Action): Store => {
  switch (type) {
    case ActionType.AUTHENTICATED:
      const user = payload as UserType | undefined;

      return {
        ...state,
        authenticating: false,
        user,
      };

    case ActionType.AUTHENTICATING:
      return {
        ...state,
        authenticating: true,
      };

    case ActionType.POSTS:
      const posts = payload as PostType[];
      return {
        ...state,
        posts: [...state.posts, ...posts],
      };

    case ActionType.INSERT_POST:
      const post = payload as PostType;
      return {
        ...state,
        posts: [post, ...state.posts],
      };

    case ActionType.CLEAR_POSTS:
      return {
        ...state,
        posts: [],
      };

    case ActionType.UPDATE_POST:
      const postId = payload as string;
      return {
        ...state,
        posts: state.posts.map((post) => {
          if (post._id === postId) {
            post.image = true;
          }
          return post;
        }),
      };

    default:
      return state;
  }
};

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, store);

  const dispatchCallback: DispatchCreator = (type: ActionType, payload?: any) =>
    dispatch({ type, payload });

  useLayoutEffect(() => {
    dispatchCallback(ActionType.AUTHENTICATING);

    // authenticate user on initial load
    axios
      .post<Body & { user: UserType }>("/user/authenticate")
      .then(({ data }) => {
        dispatchCallback(ActionType.AUTHENTICATED, data.user);
      })
      .catch(() => {
        dispatchCallback(ActionType.AUTHENTICATED, undefined);
      });
  }, []);

  return (
    <DispatchContext.Provider value={dispatchCallback}>
      <StoreContext.Provider value={state}>{children}</StoreContext.Provider>
    </DispatchContext.Provider>
  );
};

export default Provider;
// store context helpers
export const useStore = () => useContext(StoreContext);
export const useDispatch = () => useContext(DispatchContext);

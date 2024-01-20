// React
import { useState, useMemo, useLayoutEffect, useCallback, useRef } from "react";
// Styled Component
import styled from "styled-components";

// Intersection Observer
import { useInView } from "react-intersection-observer";
// Styles
import { Error, Text } from "../styles/Text";
import { Flex } from "../styles/Containers";
// Components
import { Spinner } from "../components/Loader";
import Attachment from "../components/Attachment";
import Post from "../components/Post";
// Services
import axios from "../services/axios";
// Context
import { useDispatch, useStore } from "../providers/context";
// Constants, Helpers & Types
import { PostType } from "../utils/types";
import { axiosErrorMessage } from "../utils/helpers";
import { ActionType } from "../utils/types/enum";

const Container = styled(Flex)`
  flex-direction: column;
  /* 
    Medium devices (tablets, 768px and up)
  */
  @media screen and (min-width: 768px) {
    width: 75%;
  }
`;

const Home = () => {
  const { user, posts } = useStore();
  const dispatch = useDispatch();
  const { ref, inView } = useInView({
    initialInView: true,
  });
  const [finished, setFinished] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const limitOffset = useRef({
    limit: 10,
    offset: 0,
  });

  // posts memo to prevent unnecessary re-render
  const userPosts = useMemo(
    () => (
      <Flex direction="column" padding="0 1em">
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </Flex>
    ),

    [posts]
  );

  // pagination method
  const fetchUserPosts = useCallback(() => {
    setPostLoading(true);

    axios
      .post<Body & { posts: PostType[]; count: number }>("post", {
        ...limitOffset.current,
      })
      .then(({ data }) => {
        if (!data.posts.length) {
          setFinished(true);
        } else {
          dispatch(ActionType.POSTS, data.posts);
          limitOffset.current.offset += data.count;
        }
      })
      .catch((error) => {
        const message = axiosErrorMessage(error);
        setFetchError(message);
      })
      .finally(() => {
        setPostLoading(false);
      });
  }, [limitOffset.current]);

  // pagination handling
  useLayoutEffect(() => {
    if (postLoading || finished || !inView) {
      return;
    }

    fetchUserPosts();
  }, [inView, postLoading, finished]);

  return (
    <Flex overflow="hidden" justify="center" padding="0 0.5em">
      <Container>
        {user && (
          <Attachment
            onUpdate={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          />
        )}

        {/* selected posts render */}
        {userPosts}

        {/* pagination status */}
        <Flex ref={ref} direction="column" align="center" padding="1em 0">
          {fetchError ? (
            <Error>{fetchError}</Error>
          ) : finished ? (
            <Text>Finished.</Text>
          ) : (
            <Spinner />
          )}
        </Flex>
      </Container>
    </Flex>
  );
};
export default Home;

// Styled Component
import styled, { useTheme } from "styled-components";
// Styles
import { Text } from "../styles/Text";
import { Flex, Media } from "../styles/Containers";
import { Anchor } from "../styles/Anchor";
// Services
import dayjs from "../services/dayjs";
import axios from "../services/axios";
// Components
import LoadingImage from "./LoadingImage";
import MediaType from "./MediaType";
// Helpers & Types
import { PostType } from "../utils/types";
import { imageUrl } from "../utils/helpers";

const Container = styled(Flex)`
  min-height: 50px;
  background-color: ${({ theme }) => theme.color.transparentLight};
  border-radius: 1.5em;
`;

const Post = ({ post }: { post: PostType }) => {
  const theme = useTheme();

  return (
    <Flex direction="row-reverse">
      <Container top="1em" margin={theme.spacing.bottom("1em")} padding="1.5em">
        <LoadingImage
          size="4em"
          src={imageUrl({ username: post.createdBy.username })}
        />
        <Flex
          direction="column"
          padding={theme.spacing.left("1em")}
          width="calc(100% - 4em)"
        >
          <Flex
            justify="space-between"
            align="center"
            padding={theme.spacing.bottom("0.25em")}
          >
            <Flex
              align="center"
              wrap="wrap"
              max={{
                width: "90%",
              }}
              padding={theme.spacing.bottom("0.25em")}
            >
              <Anchor to={`/user/${post.createdBy.username}`}>
                <Text bold ellipsis={1}>
                  {post.createdBy.username}
                </Text>
              </Anchor>
              <Text dim ellipsis={1} padding={theme.spacing.left("0.25em")}>
                {"@" + post.createdBy.username}
              </Text>
            </Flex>
          </Flex>
          <Text
            dim
            paragraph
            font="smaller"
            padding={theme.spacing.bottom("1em")}
          >
            {/* {"Few minutes ago"} */}
            {dayjs(post.createdDate).fromNow()}
          </Text>
          <Text paragraph padding={theme.spacing.bottom("1em")}>
            {post.body}
          </Text>
          {post.image && (
            <Media height="45em" margin={theme.spacing.bottom("1em")}>
              <MediaType
                src={axios.defaults.baseURL + `/image/post/${post._id}`}
              />
            </Media>
          )}
        </Flex>
      </Container>
    </Flex>
  );
};

export default Post;

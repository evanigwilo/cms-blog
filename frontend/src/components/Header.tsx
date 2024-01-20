// React Router
import { useNavigate } from "react-router-dom";
// Styled Component
import styled, { useTheme } from "styled-components";
// Styles
import { CalligraffittiCSS } from "../styles/Font";
import { Flex, ToolTip } from "../styles/Containers";
import { Text } from "../styles/Text";
import { Anchor } from "../styles/Anchor";
/// Services
import axios from "../services/axios";
// Components
import { Spinner } from "./Loader";
// Icons
import { PersonIcon, BoxArrowRightIcon, BoxArrowInRightIcon } from "./Icons";
// Context
import { useDispatch, useStore } from "../providers/context";
// Constants, Helpers & Types
import { ActionType } from "../utils/types/enum";
import { SEO } from "../utils/constants";

const Title = styled(Text)`
  ${CalligraffittiCSS}
  cursor: pointer;
  white-space: nowrap;
  /* width: 100%; */
  &:before {
    content: "${SEO.title}";
  }
  padding: 0.5em;
  /* mobile */
  @media (max-width: 575px) {
    text-align: center;
    width: unset;
    &:before {
      content: "${SEO.logo}";
      font-size: xx-large;
    }
  }
`;

const NavIcons = styled(Flex)`
  // all children except last child
  & > div:not(:last-child) {
    margin-right: 0.5em;
  }
`;

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, authenticating } = useStore();
  const dispatch = useDispatch();

  return (
    <Flex
      index={2}
      align="center"
      justify="space-around"
      position="sticky"
      filter={theme.blur.min}
      top="0"
    >
      <Anchor
        to="/"
        overflow="unset"
        onClick={() =>
          window.scroll({
            behavior: "smooth",
            top: 0,
          })
        }
      >
        <Title font="x-large" bold paragraph />
      </Anchor>

      <NavIcons align="center" justify="flex-end" width="unset" padding="0.5em">
        {authenticating ? (
          <Spinner />
        ) : (
          <>
            {user && (
              <>
                <ToolTip align="center" tip="Profile" border>
                  <Anchor to={`/user/${user.username}`}>
                    <PersonIcon />
                  </Anchor>
                </ToolTip>
              </>
            )}

            <ToolTip
              tip={user ? "Log out" : "Login"}
              align="center"
              border
              onClick={async () => {
                if (!user) {
                  return;
                }

                dispatch(ActionType.AUTHENTICATING);

                // logout user
                await axios.post("user/logout");

                // clear user in context
                dispatch(ActionType.AUTHENTICATED, undefined);

                //  reload page
                navigate(0);
              }}
            >
              {user ? (
                <BoxArrowRightIcon />
              ) : (
                <Anchor to="/login">
                  <BoxArrowInRightIcon />
                </Anchor>
              )}
            </ToolTip>
          </>
        )}
      </NavIcons>
    </Flex>
  );
};
export default Header;

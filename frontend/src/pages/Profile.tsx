// React
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
// Styled Component
import styled, { useTheme } from "styled-components";
// React Router
import { useParams } from "react-router-dom";
// Intersection Observer
import { useInView } from "react-intersection-observer";
// Styles
import { Error, Text } from "../styles/Text";
import { Flex, ToolTip } from "../styles/Containers";
// Components
import Post from "../components/Post";
import { Spinner } from "../components/Loader";
import LoadingImage from "../components/LoadingImage";
// Images
import backgroundProfile from "../images/Night-Jeep.jpg";
// Context
import { useDispatch, useStore } from "../providers/context";
// Services
import { AxiosError } from "axios";
import axios from "../services/axios";
// Icons
import {
  Camera2Icon,
  PencilSquareIcon,
  Check2CircleIcon,
} from "../components/Icons";
// Constants, Helpers & Types
import { PostType } from "../utils/types";
import { UserType } from "../utils/types";
import {
  axiosErrorMessage,
  imageUrl,
  updateProperty,
  updateStyle,
} from "../utils/helpers";
import { ActionType } from "../utils/types/enum";
import { SEO } from "../utils/constants";

const Background = styled.div`
  --height: 100%;
  --opacity: 1;
  --position: 50%;
  position: absolute;
  width: 100%;
  height: var(--height);
  background-color: rgb(42 55 81 / 90%);
  transition: all 0.5s;
  &:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    transition: inherit;
    box-shadow: 3px 3px 4px 0px rgb(0 0 0 / 50%);
    background-image: url(${backgroundProfile});
    background-position: 0 var(--position);
    background-repeat: no-repeat;
    background-size: 100% 200%;
    opacity: var(--opacity);
  }
`;

const Container = styled.div`
  width: 100%;
  height: calc(8em + 16px);
  z-index: 1;
  position: sticky;
  top: 0;
`;

const HeaderContainer = styled(Flex)`
  --dimension: 8em;
  z-index: 1;
  top: 3px;
  align-items: flex-start;
  position: sticky;
  margin-top: calc(var(--dimension) / -2);
  padding: 0 1em;
`;

const Header = styled(Flex)<{
  alignSelf: "center" | "end";
}>`
  transition: all 0.5s;
  margin-left: 1em;
  align-self: ${({ alignSelf }) => alignSelf};
  flex-direction: column;
  overflow: hidden;
  /* mobile */
  @media (max-width: 575px) {
    margin-left: 0.5em;
  }
`;

const Bio = styled(Text)`
  transition: all 0.5s;
  opacity: 1;
  line-height: 1.3;
  display: block;
  margin-right: 0.5em;
  height: auto;
  padding: 0;
  &:read-write:focus {
    outline: none;
  }
`;

const Profile = () => {
  const theme = useTheme();
  const params = useParams();
  const { authenticating, posts, user: currentUser } = useStore();
  const dispatch = useDispatch();
  const { ref, inView } = useInView({
    initialInView: true,
  });

  const [finished, setFinished] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [user, setUser] = useState<UserType | undefined>();
  const [uploadError, setUploadError] = useState("");
  const [bioError, setBioError] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [editBio, setEditBio] = useState<"EDIT" | "SAVE" | "NONE">("NONE");
  const header = useRef<HTMLDivElement | null>(null);
  const bio = useRef<HTMLSpanElement | null>(null);
  const limitOffset = useRef({
    limit: 10,
    offset: 0,
  });
  const background = useRef<HTMLImageElement | null>(null);
  const selectedFile = useRef<File | null>(null);

  const canUpdateProfile = useMemo(
    () => currentUser?.username === params.username,
    [currentUser, params]
  );

  // selected posts render
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
      .post<Body & { posts: PostType[]; count: number }>(
        `post/${params.username}`,
        {
          ...limitOffset.current,
        }
      )
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
  }, [params, limitOffset.current]);

  // page title
  useLayoutEffect(() => {
    if (user) {
      document.title = `${user.username} / ${SEO.title}`;
    }
  }, [user]);

  // scrolling events handling
  useLayoutEffect(() => {
    const addScrollListener = (ev?: TransitionEvent) => {
      if (!ev || ev.propertyName === "opacity") {
        window.addEventListener("scroll", handleScroll, { passive: true });
      }
    };

    const removeScrollListener = (ev?: TransitionEvent) => {
      if (!ev || ev.propertyName === "opacity") {
        window.removeEventListener("scroll", handleScroll);
      }
    };

    // hide bio based on scroll position
    const bioScroll = (ratio: number) => {
      const bioElement = bio.current;
      if (!bioElement) {
        return;
      }

      bioElement.removeEventListener("transitionend", addScrollListener);
      bioElement.addEventListener("transitionend", addScrollListener);

      const bioContainer = bioElement.parentElement as HTMLDivElement;
      const edit = header.current?.querySelector<HTMLDivElement>(".bio-change");
      const opacity = bioElement.style.opacity;

      // scrolled top
      if (ratio < 0.5 && opacity === "0") {
        removeScrollListener();
        updateStyle(bioContainer, { padding: "" });
        updateStyle(bioElement, { lineHeight: "", opacity: "" });
        updateStyle(edit, { opacity: "" });
      }
      // scrolled bottom
      else if (ratio >= 0.5 && opacity === "") {
        removeScrollListener();
        updateStyle(bioContainer, { padding: "0" });
        updateStyle(bioElement, { lineHeight: "0", opacity: "0" });
        updateStyle(edit, { opacity: "0" });
      }
    };

    // scroll handler and header background animation handler
    const handleScroll = () => {
      const backgroundElement = background.current;
      if (!header.current || !backgroundElement) {
        return;
      }

      const { clientHeight } = header.current;
      const height = Math.min(clientHeight, window.scrollY);
      const ratio = height / clientHeight;

      updateProperty(backgroundElement, {
        "--height": (1 - ratio) * 10 + 100 + "%",
        "--opacity": (1 - ratio + 0.7).toString(),
        "--position": 15 * ratio + 50 + "%",
      });

      bioScroll(ratio);
    };

    handleScroll();

    addScrollListener();

    // remove event listener on unmount
    return () => removeScrollListener();
  }, []);

  // url parameters change handling
  useLayoutEffect(() => {
    // scroll to top on url parameters change
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    setEditBio("NONE");

    // reset various styles to initial values
    const headerElement = header.current;
    const loader = headerElement?.querySelector(".loader") as HTMLDivElement;
    const percent = headerElement?.querySelector(".percent") as HTMLSpanElement;
    const update = headerElement?.querySelector(
      ".update"
    ) as HTMLDivElement | null;

    updateStyle(loader, {
      display: "flex",
    });
    updateStyle(update, {
      display: "flex",
    });
    percent.textContent = "";

    setFinished(false);
    limitOffset.current.offset = 0;
    dispatch(ActionType.CLEAR_POSTS);

    axios
      .get<Body & { user: UserType }>(`user/${params.username}`)
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch(() => {});
  }, [params.username]);

  // pagination handling
  useLayoutEffect(() => {
    if (postLoading || finished || !inView) {
      return;
    }

    fetchUserPosts();
  }, [inView, postLoading, finished]);

  // update biography handling
  useEffect(() => {
    const bioElement = bio.current;
    if (!bioElement || editBio === "NONE") {
      return;
    }
    if (editBio === "EDIT") {
      bioElement.setAttribute("contenteditable", "true");
      bioElement.classList.add("bio-edit");
      bioElement.focus();
    }
    if (editBio === "SAVE") {
      setBioLoading(true);
      setBioError("");

      axios
        .post<Body & { user: UserType }>("user/update-bio", {
          bio: bioElement.innerText,
        })
        .then(({ data }) => {
          dispatch(ActionType.AUTHENTICATED, data.user);
        })
        .catch((error) => {
          const message = axiosErrorMessage(error);
          setBioError(message);
        })
        .finally(() => {
          setBioLoading(false);
          bioElement.setAttribute("contenteditable", "false");
          bioElement.classList.remove("bio-edit");
          setEditBio("NONE");
        });
    }
  }, [editBio]);

  return (
    <>
      <Container>
        <Background ref={background} />
      </Container>
      <HeaderContainer ref={header}>
        <LoadingImage
          src={imageUrl({ username: params.username })}
          size="var(--dimension)"
          percent={true}
          prop={{
            border: {
              radius: "50%",
              width: "5px",
            },
          }}
          onLoad={() => {
            // show update profile icon after profile image loads
            const update = header.current?.querySelector(
              ".update"
            ) as HTMLDivElement | null;
            updateStyle(update, {
              display: "flex",
            });
          }}
          element={
            <>
              {canUpdateProfile && (
                <form
                  method="post"
                  encType="multipart/form-data"
                  onSubmit={(event) => {
                    // prevent the form from submitting
                    event.preventDefault();

                    const loader = header.current?.querySelector(
                      ".loader"
                    ) as HTMLDivElement;
                    const percent = header.current?.querySelector(
                      ".percent"
                    ) as HTMLSpanElement;
                    const update = header.current?.querySelector(
                      ".update"
                    ) as HTMLDivElement;

                    // reset upload progress and related styles
                    percent.textContent = "0 %";
                    updateStyle(loader, {
                      display: "flex",
                    });
                    updateStyle(update, {
                      display: "none",
                    });

                    // clear upload error
                    setUploadError("");

                    const formData = new FormData();
                    formData.append("image", selectedFile.current!);

                    axios
                      .post("/image", formData, {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                        // upload progress callback
                        onUploadProgress: ({
                          loaded,
                          total,
                        }: Record<string, number>) => {
                          percent.textContent =
                            Math.round((100 * loaded) / total) + " %";
                        },
                      })
                      .then(() => {
                        const image = header.current?.querySelector(
                          ".image"
                        ) as HTMLImageElement;

                        // show newly updated profile after successful upload
                        image.src = imageUrl({ username: params.username });
                      })
                      .catch(({ response }: AxiosError) => {
                        if (!response) {
                          return;
                        }
                        const {
                          data: { message },
                        } = response;

                        // set upload error caught
                        setUploadError(message);
                      });
                  }}
                >
                  <input
                    className="upload"
                    type="file"
                    hidden
                    accept="image/*"
                    onClick={({ currentTarget }) => {
                      //
                      // clear previous selected file on each onclick event
                      // so as to trigger the onchange event even if the same path is selected
                      currentTarget.value = "";
                    }}
                    onChange={({ currentTarget }) => {
                      setUploadError("");
                      // select only the first file user chose
                      const file = currentTarget.files?.item(0);
                      if (file) {
                        selectedFile.current = file;
                        const submit = header.current?.querySelector(
                          ".submit"
                        ) as HTMLInputElement;
                        // manually trigger form submit event
                        submit.click();
                      }
                    }}
                  />

                  {/* hidden submit button */}
                  <input className="submit" type="submit" hidden />

                  <ToolTip
                    className="update"
                    index={1}
                    position="absolute"
                    align="flex-start"
                    padding="3px"
                    top={`calc(var(--dimension) - ${theme.sizing.icon} - 3px)`}
                    right={`calc(${theme.sizing.icon} / 4)`}
                    tip="Upload"
                    border
                    background="blurMin"
                    tipPosition="bottom"
                    scale={1.05}
                    onClick={() => {
                      const upload = header.current?.querySelector(
                        ".upload"
                      ) as HTMLInputElement;
                      // manually call file selector
                      upload.click();
                    }}
                  >
                    <Camera2Icon />
                  </ToolTip>
                </form>
              )}
            </>
          }
        />

        <Header alignSelf={uploadError ? "center" : "end"}>
          <Flex align="center">
            <Text
              dim
              padding="0.25em 0"
              ellipsis={1}
              margin={theme.spacing.right("1em")}
            >
              @ {params.username}
            </Text>
          </Flex>
          {authenticating ? (
            <Spinner />
          ) : (
            <>
              <Text bold font="x-large" ellipsis={1}>
                {user?.username || "-"}
              </Text>

              <Flex padding={"0.5em 0"} align="flex-start">
                <Bio
                  ref={bio}
                  ellipsis={2}
                  onInput={() =>
                    // always scroll to top when updating bio
                    window.scrollTo({
                      top: 0,
                      behavior: "auto",
                    })
                  }
                >
                  {user?.bio || "-"}
                </Bio>

                {canUpdateProfile && (
                  <>
                    {bioLoading ? (
                      <Spinner />
                    ) : (
                      <ToolTip
                        hover={false}
                        className="bio-change"
                        tip={editBio === "EDIT" ? "Save" : "Edit"}
                        tipPosition="top"
                        margin={theme.spacing.right("0.5em")}
                        padding={theme.spacing.top("0.125em")}
                        scale={1.05}
                        onClick={() => {
                          if (editBio === "NONE") {
                            setEditBio("EDIT");
                          } else if (editBio === "EDIT") {
                            setEditBio("SAVE");
                          }
                        }}
                      >
                        {editBio === "EDIT" ? (
                          <Check2CircleIcon />
                        ) : (
                          <PencilSquareIcon />
                        )}
                      </ToolTip>
                    )}
                  </>
                )}
              </Flex>

              {bioError && <Error>{bioError}</Error>}
            </>
          )}
        </Header>
      </HeaderContainer>
      {uploadError && <Error padding="0 1em">{uploadError}</Error>}

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
    </>
  );
};

export default Profile;

// React
import { useState, useRef, useLayoutEffect, useCallback } from "react";
// Styled Component
import styled, { useTheme } from "styled-components";
// Styles
import { Flex, Media, ToolTip } from "../styles/Containers";
import { Error, Text } from "../styles/Text";
import { InputCSS } from "../styles/Input";
// Context
import { useDispatch, useStore } from "../providers/context";
// Components
import MediaType from "./MediaType";
import LoadingImage from "./LoadingImage";
import { ImageIcon } from "./Icons";
// Services
import axios from "../services/axios";
import { AxiosError } from "axios";
// Constants, Helpers & Types
import { PostType } from "../utils/types";
import { ActionType } from "../utils/types/enum";
import { axiosErrorMessage, imageUrl, updateStyle } from "../utils/helpers";

const Send = styled(Text)`
  padding: 0;
  transform: scale(1.2, 2);
`;

const TextInput = styled.textarea.attrs(() => ({
  rows: 1,
  cols: 25,
  autoFocus: false,
}))`
  ${InputCSS};
  height: min-content;
  margin: 0 1em;
  overflow: hidden;
  line-height: 1.25em;
  color: white;
  caret-color: white;
  @media screen and (min-width: 576px) {
    padding-right: 1em;
  }
`;

const Attachment = ({ onUpdate }: { onUpdate?: () => void }) => {
  const theme = useTheme();
  const { user } = useStore();
  const dispatch = useDispatch();
  const media = useRef<HTMLDivElement | null>(null);
  const upload = useRef<HTMLInputElement | null>(null);
  const submit = useRef<HTMLInputElement | null>(null);
  // file with object url property
  const [selectedFile, setSelectedFile] = useState<
    (File & { url?: string }) | null
  >(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const status = useRef<"FILE" | "LOADING" | "ERROR" | "NONE">("NONE");
  const postId = useRef("");
  // abort controller for canceling uploads
  const abortController = useRef(new AbortController());

  const AttachIcon = useCallback(
    () => (
      <form
        method="post"
        encType="multipart/form-data"
        onSubmit={(event) => {
          // prevent the form from submitting
          event.preventDefault();

          setStatus("LOADING", true);

          const mediaElement = media.current;

          const percent = mediaElement?.querySelector(
            ".percent"
          ) as HTMLSpanElement;

          // reset percent
          percent.textContent = "0 %";

          const spinner = mediaElement?.querySelector(
            ".spinner"
          ) as HTMLDivElement;
          // show spinner with uploading style
          spinner.classList.add("progress", "upload");
          spinner.classList.replace("hide", "show");

          // reset previous errors
          setStatus("ERROR", "");

          const url = `image/post/${postId.current}`;

          const formData = new FormData();
          formData.append("image", selectedFile!);

          axios
            .post(url, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: ({ loaded, total }: Record<string, number>) => {
                // format upload percent
                percent.textContent = Math.round((100 * loaded) / total) + " %";
              },
              signal: abortController.current.signal,
            })
            .then((data) => {
              // set this post to have image
              dispatch(ActionType.UPDATE_POST, postId.current);
              closeMedia();
            })
            .catch(({ response }: AxiosError) => {
              // not a canceled upload
              if (!response) {
                return;
              }
              const {
                data: { message },
                statusText,
              } = response;

              setStatus("ERROR", message || statusText);
            })
            .finally(() => {
              // hide spinner and reset percent
              spinner.classList.replace("show", "hide");
              spinner.classList.remove("progress", "upload");
              percent.textContent = "0 %";
              setStatus("LOADING", false);
              // reset post identifier
              postId.current = "";
            });
        }}
      >
        <input
          ref={upload}
          type="file"
          hidden
          accept="audio/*,video/*,image/*"
          // multiple
          onChange={({ target }) => {
            setStatus("ERROR", "");

            const file = target.files?.item(0) as typeof selectedFile;
            if (file) {
              // URL represents the specified File object
              file.url = URL.createObjectURL(file);
              setStatus("FILE", file);
            }
          }}
        />

        {/* the submit input for the form */}
        <input type="submit" ref={submit} hidden />

        <ToolTip
          hover={false}
          tipPosition="top"
          tip="Media"
          onClick={() => upload.current?.click()}
        >
          <ImageIcon />
        </ToolTip>
      </form>
    ),
    [selectedFile]
  );

  const AttachMedia = useCallback(
    () =>
      selectedFile && (
        <Media ref={media} width="calc(100% - 6em)">
          <MediaType
            src={selectedFile.url!}
            afterLoad={() => {
              const remove =
                media.current?.querySelector<HTMLDivElement>(".remove");
              // show remove icon
              updateStyle(remove, {
                opacity: "1",
                pointerEvents: "unset",
              });

              setStatus("LOADING", false);
            }}
          />

          <ToolTip
            className="remove"
            opacity={0}
            disabled
            tip="Remove"
            padding="0"
            border
            position="absolute"
            right="0"
            top="0"
            width="25px"
            height="25px"
            align="center"
            justify="center"
            onClick={() => {
              const mediaElement = media.current;
              mediaElement?.addEventListener("transitionend", closeMedia);
              updateStyle(mediaElement, {
                opacity: "0",
              });
            }}
          >
            <Text dim font="1.25em">
              ✕
            </Text>
          </ToolTip>
        </Media>
      ),
    [selectedFile]
  );

  // media url revoke
  const revokeUrl = useCallback(() => {
    const url = selectedFile?.url;
    url && URL.revokeObjectURL(url);
  }, [selectedFile]);

  const setStatus = useCallback(
    (key: typeof status.current, value: unknown) => {
      status.current = key;

      switch (key) {
        case "FILE":
          setSelectedFile(value as typeof selectedFile);
          break;

        case "LOADING":
          setLoading(value as typeof loading);
          break;

        case "ERROR":
          setError(value as typeof error);
          break;

        default:
          break;
      }
    },
    []
  );

  const closeMedia = useCallback(() => {
    const spinner = media.current?.querySelector<HTMLDivElement>(".spinner");
    if (spinner?.classList.contains("show")) {
      abortController.current.abort();
      abortController.current = new AbortController();
    }
    revokeUrl();
    setStatus("FILE", null);
  }, [selectedFile]);

  useLayoutEffect(() => {
    switch (status.current) {
      case "FILE":
        onUpdate?.();
        if (selectedFile) {
          setStatus("LOADING", true);
        } else {
          setStatus("ERROR", "");
        }
        break;

      case "LOADING":
      case "ERROR":
        onUpdate?.();
        break;

      default:
        break;
    }
  }, [selectedFile, loading, error]);

  // revoke object ur on unmount
  useLayoutEffect(() => {
    return () => revokeUrl();
  }, []);

  return (
    <>
      <AttachMedia />

      {!loading && error && <Error margin="auto">{error}</Error>}

      <Flex
        index={3}
        align="center"
        justify="center"
        padding="0 0.5em"
        margin={theme.spacing.top("0.5em")}
        disabled={loading}
        opacity={loading ? "dim" : 1}
      >
        <Flex index={1} align="center">
          <LoadingImage
            src={imageUrl({ username: user?.username })}
            size="40px"
          />
          <TextInput
            placeholder="What’s happening?"
            value={text}
            onInput={({ currentTarget }) => {
              setText(currentTarget.value);
            }}
          />
        </Flex>

        <Flex width="unset" align="center">
          <AttachIcon />
          <ToolTip
            hover={false}
            tipPosition="top"
            tip="Post"
            margin={theme.spacing.left("1em")}
            onClick={() => {
              setStatus("LOADING", true);

              axios
                .put<Body & { post: PostType }>("post/create", {
                  body: text,
                })
                .then(({ data }) => {
                  setText("");

                  dispatch(ActionType.INSERT_POST, {
                    ...data.post,
                    createdBy: user,
                  });

                  // upload post image
                  if (selectedFile) {
                    postId.current = data.post._id;
                    submit.current?.click();
                  }
                })
                .catch((error) => {
                  const message = axiosErrorMessage(error);
                  setError(message);
                })
                .finally(() => {
                  setStatus("LOADING", false);
                });
            }}
          >
            <Send dim>➢</Send>
          </ToolTip>
        </Flex>
      </Flex>
    </>
  );
};

export default Attachment;

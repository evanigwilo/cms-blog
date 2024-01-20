// React
import { useState, useRef, useLayoutEffect, useCallback } from "react";
// Styled Component
import { useTheme } from "styled-components";
// Styled Component
import { useResize } from "../hooks/useResize";
// Styles
import { Flex } from "../styles/Containers";
import { Text } from "../styles/Text";
// Components
import { Spinner } from "./Loader";
// Constants, Helpers & Types
import { updateStyle } from "../utils/helpers";

const MediaType = ({
  src, // image source
  afterLoad, // after image loads callback
}: {
  src: string;
  afterLoad?: () => void;
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const image = useRef<HTMLImageElement | null>(null);
  const spinner = useRef<HTMLDivElement | null>(null);

  const updateDimensions = useCallback(() => {
    if (loading) {
      return;
    }
    const spinnerElement = spinner.current;
    const mediaElement = image.current;

    if (spinnerElement && mediaElement) {
      // hide spinner
      spinnerElement.classList.replace("show", "hide");
      // for smooth update of post reply threads, set dimensions of image after visible
      mediaElement.hidden = false;

      let height = "";
      let width = "";

      updateStyle(mediaElement, {
        height,
        width,
      });
      updateStyle(spinnerElement, {
        height,
        width,
      });

      const { clientWidth, clientHeight } = mediaElement;
      height = clientHeight + "px";
      width = clientWidth + "px";

      updateStyle(mediaElement, {
        height,
        width,
      });
      updateStyle(spinnerElement, {
        height,
        width,
      });
    }

    afterLoad?.();
  }, [loading]);

  useLayoutEffect(() => updateDimensions(), [loading]);

  useResize(() => updateDimensions());

  return (
    <>
      <img
        alt="image-source"
        ref={image}
        src={src}
        hidden
        onLoad={() => setLoading(false)}
      />

      <div ref={spinner} className="spinner show">
        <Flex width="unset" direction="column" align="center">
          <Spinner />
          <Text
            className="percent"
            font="smaller"
            padding={theme.spacing.top("0.25em")}
          />
        </Flex>
      </div>
    </>
  );
};

export default MediaType;

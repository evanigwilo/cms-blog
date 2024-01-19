//  Styled Component
import styled, { css } from "styled-components";
//  Styles
import { BackgroundCSS } from "./Background";
import { HoverCSS } from "./Interactions";

export const Flex = styled.div<{
  align?: "flex-start" | "flex-end" | "center";
  justify?:
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  direction?: "column" | "column-reverse" | "row-reverse";
  wrap?: "wrap" | "wrap-reverse";
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  position?: "absolute" | "sticky" | "static" | "fixed";
  index?: number;
  ratio?: number;
  opacity?: number | "dim";
  filter?: string;
  border?:
    | boolean
    | Partial<{
        width: string;
        radius: string;
      }>;
  disabled?: boolean;
  background?: boolean | "blurMin" | "blurMax" | "loading";
  cursor?: string;
  overflow?: "hidden" | "scroll";
  max?: Partial<{
    height: string;
    width: string;
  }>;
}>`
  display: flex;
  aspect-ratio: ${({ ratio }) => ratio};
  opacity: ${({ opacity, theme }) =>
    opacity === "dim" ? theme.opacity.dim : opacity};
  flex-wrap: ${({ wrap }) => wrap || "nowrap"};
  position: ${({ position }) => position || "relative"};
  top: ${({ top }) => top};
  left: ${({ left }) => left};
  bottom: ${({ bottom }) => bottom};
  right: ${({ right }) => right};
  z-index: ${({ index }) => index || 0};
  flex-direction: ${({ direction }) => direction || "row"};
  align-items: ${({ align }) => align || "stretch"};
  justify-content: ${({ justify }) => justify || "flex-start"};
  width: ${({ width }) => width || "100%"};
  height: ${({ height }) => height};
  margin: ${({ margin }) => margin};
  padding: ${({ padding }) => padding};
  overflow: ${({ overflow }) => overflow};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "unset")};
  cursor: ${({ cursor }) => (cursor ? cursor + " !important" : "default")};
  max-height: ${({ max }) => max?.height};
  max-width: ${({ max }) => max?.width};

  ${({ border, theme }) =>
    border &&
    css`
      border: ${border === true ? "0.25em" : border.width || "0.25em"} solid
        ${theme.color.transparentLight};
      border-radius: ${border === true ? "10px" : border.radius || "10px"};
    `}

  ${({ background }) =>
    background &&
    (background === "loading"
      ? css`
          background-color: ${({ theme }) => theme.color.loading};
        `
      : background === true
      ? css`
          --position: absolute;
          --attachment: local; /* use local for box-shadow to work well separate from background image */
          ${BackgroundCSS}
        `
      : css`
          backdrop-filter: ${({ theme }) =>
            background === "blurMax" ? theme.blur.max : theme.blur.min};
        `)}

  /* backdrop-filter didn't work on Mac Chrome unless with pseudo element */
  ${({ filter }) => {
    return (
      filter &&
      css`
        &::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          backdrop-filter: ${filter};
          z-index: -1;
          border-radius: inherit;
        }
      `
    );
  }}
`;

export const List = styled(Flex)`
  overflow: hidden;
  overflow-y: auto;
  height: ${({ height }) => height || "100%"};
  flex-direction: ${({ direction }) => direction || "column"};
`;

export const ToolTip = styled(Flex)<{
  badge?: string | number;
  tip?: string;
  tipPosition?: "top" | "bottom" | "left" | "right";
  tipOffset?: string;
  scale?: 1.1 | 1.05 | 1.03;
  badgeTipPadding?: string;
  ignoreMobile?: boolean;
  hover?: boolean;
}>`
  ${HoverCSS}
  --scale : ${({ scale }) => scale || 1};
  --tipOffset: ${({ tipOffset, border }) =>
    tipOffset || border ? "1em" : "0.5em"};
  --backgroundColor: ${({ hover, theme }) =>
    hover !== false && theme.color.transparentLight};
  //  update the default hovering color from 'HoverCSS' above
  --hoverColor: var(--backgroundColor);
  --badgeTipPadding: ${({ badgeTipPadding }) =>
    badgeTipPadding || "0.25em 0.5em"};
  --blur: ${({ theme }) => theme.blur.mid};

  box-sizing: content-box;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  width: ${({ width }) => width || "unset"};

  ${({ border, padding }) =>
    border &&
    css`
      border-radius: ${border === true ? "50%" : border.radius};
      padding: ${padding || "6px"};
      border: ${`${
        border === true ? "2px" : border.width || "2px"
      } solid var(--backgroundColor)`};
    `};

  ${({ badge }) =>
    badge !== undefined &&
    css`
      &:before {
        content: ${`"${badge}"`};
        position: absolute;
        padding: var(--badgeTipPadding);
        background-color: var(--backgroundColor);
        backdrop-filter: var(--blur);
        color: white;
        font-size: xx-small;
        border-radius: 10px;
        top: 0;
        transform: translate(75%, -80%);
      }
    `};

  ${({ tip, tipPosition, ignoreMobile }) => {
    if (!tip) {
      return;
    }

    const tipLocation =
      tipPosition === "left"
        ? css`
            right: 100%;
            margin-right: var(--tipOffset);
          `
        : tipPosition === "right"
        ? css`
            left: 100%;
            margin-left: var(--tipOffset);
          `
        : tipPosition === "top"
        ? css`
            top: 0;
            transform: translateY(calc(-100% - var(--tipOffset)));
          `
        : css`
            bottom: 0;
            transform: translateY(calc(100% + var(--tipOffset)));
          `;

    const style = css`
      &:hover:after {
        --opacity: 1;
        --pointer: unset;
      }
      &:after {
        --opacity: 0;
        --pointer: none;

        //  list type display
        ${tip.includes("A") &&
        css`
          display: flex;
          justify-content: center;
          text-align-last: left;
          white-space: pre;
          align-items: center;
        `}
        transition: inherit;
        opacity: var(--opacity);
        pointer-events: var(--pointer);
        content: ${`"${tip}"`};
        position: absolute;
        background-color: ${({ theme }) => theme.color.transparentLight};
        backdrop-filter: var(--blur);
        color: white;
        font-size: xx-small;
        padding: var(--badgeTipPadding);
        border-radius: 10px;
        z-index: 2;
        ${tipLocation};
      }
    `;
    return ignoreMobile
      ? style
      : css`
          @media (min-width: 576px) {
            ${style}
          }
        `;
  }}
`;

export const Media = styled.div<{
  height?: string;
  margin?: string;
  width?: string;
}>`
  color: white;
  max-height: ${({ height }) => height || "300px"};
  transition: opacity 0.25s;
  text-align: center;
  width: 100%;
  position: relative;
  margin: ${({ margin }) => margin || "0.5em 0"};

  & .spinner {
    position: relative;
    font-weight: bold;
    backdrop-filter: blur(3px);
    max-width: 100%;
    place-items: center;
    z-index: 1;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  & .progress {
    background: ${({ theme }) => theme.color.loading};
  }
  & .show {
    display: grid;
    pointer-events: unset;
  }
  & .hide {
    display: none;
    pointer-events: none;
  }
  & .upload {
    position: absolute;
  }

  & > img,
  .spinner {
    border-radius: 10px;
    max-width: ${({ width }) => width || "100%"};
    max-height: 100%;
    object-fit: contain;
  }
`;

// Styled Component
import styled, { css } from "styled-components";
// Icons
import { Image } from "@styled-icons/bootstrap/Image";
import { Person } from "@styled-icons/bootstrap/Person";
import { PencilSquare } from "@styled-icons/bootstrap/PencilSquare";
import { Camera2 } from "@styled-icons/bootstrap/Camera2";
import { Check2Circle } from "@styled-icons/bootstrap/Check2Circle";
import { BoxArrowInRight } from "@styled-icons/bootstrap/BoxArrowInRight";
import { BoxArrowRight } from "@styled-icons/bootstrap/BoxArrowRight";
// Styles
import { IconCSS } from "../styles/Icon";
// Constants, Helpers & Types
import { Spacing } from "../utils/types";

export const ImageIcon = styled(Image)<{ dimension?: string }>`
  ${IconCSS};
  ${({ dimension }) =>
    dimension &&
    css`
      --dimension: ${dimension};
    `};
`;

export const Camera2Icon = styled(Camera2)<Spacing>`
  ${IconCSS};
`;

export const PencilSquareIcon = styled(PencilSquare)`
  ${IconCSS};
`;
export const Check2CircleIcon = styled(Check2Circle)<Spacing>`
  ${IconCSS};
`;

export const PersonIcon = styled(Person)`
  ${IconCSS};
`;
export const BoxArrowInRightIcon = styled(BoxArrowInRight)<Spacing>`
  ${IconCSS};
`;
export const BoxArrowRightIcon = styled(BoxArrowRight)<Spacing>`
  ${IconCSS};
`;

//  React Router
import { Link } from "react-router-dom";
//  Styled Component
import styled from "styled-components";
//  Styles
import { HoverCSS } from "./Interactions";

export const Anchor = styled(Link)<{
  width?: string;
  overflow?: string;
}>`
  text-decoration: none;
  overflow: ${({ overflow }) => overflow || "hidden"};
  text-overflow: ellipsis;
  color: white;
  width: ${({ width }) => width};
  ${HoverCSS};
  //  update the default hovering color from 'HoverCSS' above
  --hoverColor: none;
`;

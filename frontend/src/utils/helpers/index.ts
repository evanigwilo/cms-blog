// Services
import axios from "../../services/axios";
// Constants, Helpers & Types
import { AxiosError } from "axios";

// seconds to milliseconds convert for intervals
export const secsToMs = (secs: number) => secs * 1000;

export const updateStyle = (
  element: ChildNode | HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>
) => {
  if (!element) {
    return;
  }

  const node = element as HTMLElement;
  for (const property in style) {
    node.style[property] = style[property] || "";
  }
};

export const updateProperty = (
  element: HTMLElement | null | undefined,
  style: Record<string, string>
) => {
  if (!element) {
    return;
  }

  for (const property in style) {
    element.style.setProperty(property, style[property]);
  }
};

export const imageUrl = (args: Partial<{ postId: string; username: string }>) =>
  `${axios.defaults.baseURL}/image/${
    args.postId ? `post/${args.postId}` : args.username
  }?${Date.now()}`;

export const axiosErrorMessage = (error: unknown) => {
  const response = (error as AxiosError).response;
  return response?.data.message;
};

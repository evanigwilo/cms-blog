// React
import { useLayoutEffect } from "react";

export const useResize = (callback: (ev?: UIEvent) => void, runOnce = true) => {
  useLayoutEffect(() => {
    // Handler to call on window resize
    window.removeEventListener("resize", callback);
    // Add event listener
    window.addEventListener("resize", callback);

    // Calls handler right away so state gets updated with initial window size
    runOnce && callback();

    return () =>
      // Remove event listener
      window.removeEventListener("resize", callback);
  }, []);
};

import { ViewTransition } from "react";

// A template remounts on every navigation, so the old page exits and the new
// one enters as a pair. Link transitionTypes pick the direction; anything else
// (browser back/forward, plain links) crossfades. Animations live in
// styles/globals.css under "Page transitions".
export default function Template({ children }) {
  return (
    <ViewTransition
      default="none"
      enter={{
        default: "page-fade-in",
        "nav-back": "page-in-back",
        "nav-forward": "page-in-forward",
      }}
      exit={{
        default: "page-fade-out",
        "nav-back": "page-out-back",
        "nav-forward": "page-out-forward",
      }}
    >
      <div>{children}</div>
    </ViewTransition>
  );
}

import { ViewTransition } from "react";

// morph: view transition name shared with a home page section link.
export default function TitleDescription({ title, description, morph }) {
  const heading = <h1 className="w-fit font-bold text-2xl sm:text-3xl">{title}</h1>;
  return (
    <div className="w-full">
      {morph ? (
        <ViewTransition name={morph} share="morph">
          {heading}
        </ViewTransition>
      ) : (
        heading
      )}
      <p className="my-3 text-p3-text-light text-sm sm:text-lg">{description}</p>
    </div>
  );
}

"use client";

import SplashCursor from "@components/reactbits/SplashCursor";
import TitleDescription from "@components/TitleDescription";
import { ScrollArea } from "@components/ui/scroll-area";
import { Unsplash } from "@lib/unsplash";
import NextImage from "next/image";
import NextLink from "next/link";
import { useEffect, useState } from "react";

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      const unsplash = new Unsplash();
      const data = await unsplash.getPhotos();
      setPhotos(data);
      setLoading(false);
    };
    loadPhotos();
  }, []);

  return (
    <div className="w-full">
      <ScrollArea className="max-h-[calc(100dvh-11rem)]">
        <TitleDescription description="A collection of photos that I have taken." title="Photos" />
        <div className="gap-1 pt-2 pb-32 sm:columns-3">
          {loading ? (
            <SkeletonGrid />
          ) : (
            photos.map((photo, index) => <Photo data={photo} index={index} key={photo.id} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function SkeletonGrid() {
  const skeletons = [
    { height: 280, id: "s1" },
    { height: 220, id: "s2" },
    { height: 320, id: "s3" },
    { height: 260, id: "s4" },
    { height: 300, id: "s5" },
    { height: 240, id: "s6" },
    { height: 280, id: "s7" },
    { height: 320, id: "s8" },
    { height: 260, id: "s9" },
    { height: 220, id: "s10" },
    { height: 300, id: "s11" },
    { height: 280, id: "s12" },
  ];

  return (
    <div className="gap-1 sm:columns-3">
      {skeletons.map((skeleton) => (
        <div
          className="mb-2 animate-pulse rounded-sm bg-p3-background-dark/10 md:mb-1 dark:bg-p3-background-light/10"
          key={skeleton.id}
          style={{ height: `${skeleton.height}px` }}
        />
      ))}
    </div>
  );
}

function Photo({ data: photo, index }) {
  const { urls, description, alt_description, width, height, links } = photo;

  // Use Unsplash's own blur URL for a more natural placeholder
  const blurDataURL = `${urls.thumb}&blur=50&w=10&q=1`;

  return (
    <div className="group mb-2 overflow-hidden rounded-sm md:mb-1">
      <NextLink href={links.html}>
        <NextImage
          alt={description || alt_description || "Unsplash Photo"}
          blurDataURL={blurDataURL}
          className="transition-transform duration-200 group-hover:scale-[1.02]"
          height={height}
          loading={index < 3 ? "eager" : "lazy"}
          placeholder="blur"
          priority={index < 3}
          src={urls.regular}
          title={description}
          width={width}
        />
      </NextLink>
    </div>
  );
}

import { AWS, Calcom, Github, Google, Meta, Twitch } from "@components/icons";
import { cn } from "@lib/utils";
import { AnimatePresence, motion } from "motion/react";

export const DivOrigamiExample = () => {
  return (
    <section className="flex h-72 flex-col items-center justify-center gap-12 bg-p3-background px-4 py-24 md:flex-row">
      <LogoRolodex
        items={[
          <LogoItem className="bg-p3-primary text-p3-text" key={1}>
            <AWS />
          </LogoItem>,
          <LogoItem className="bg-p3-secondary text-p3-text" key={2}>
            <Calcom />
          </LogoItem>,
          <LogoItem className="bg-p3-accent text-p3-text" key={3}>
            <Meta />
          </LogoItem>,
          <LogoItem className="bg-p3-background-light text-p3-text" key={4}>
            <Github />
          </LogoItem>,
          <LogoItem className="bg-p3-primary-light text-p3-text" key={5}>
            <Twitch />
          </LogoItem>,
          <LogoItem className="bg-p3-background-light text-p3-text" key={6}>
            <Google />
          </LogoItem>,
        ]}
      />
    </section>
  );
};

const DELAY_IN_MS = 2500;
const TRANSITION_DURATION_IN_SECS = 1.5;

const LogoRolodex = ({ items }) => {
  const intervalRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((pv) => pv + 1);
    }, DELAY_IN_MS);

    return () => {
      clearInterval(intervalRef.current || undefined);
    };
  }, []);

  return (
    <div
      className="relative z-0 h-44 w-60 shrink-0 rounded-xl border border-p3-border bg-p3-background"
      style={{
        transform: "rotateY(-20deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <AnimatePresence mode="sync">
        <motion.div
          animate={{ rotateX: "0deg" }}
          className="absolute top-1/2 left-1/2"
          exit={{ rotateX: "-180deg" }}
          initial={{ rotateX: "0deg" }}
          key={index}
          style={{
            backfaceVisibility: "hidden",
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
            x: "-50%",
            y: "-50%",
            zIndex: -index,
          }}
          transition={{
            duration: TRANSITION_DURATION_IN_SECS,
            ease: "easeInOut",
          }}
        >
          {items[index % items.length]}
        </motion.div>
        <motion.div
          animate={{ rotateX: "0deg" }}
          className="absolute top-1/2 left-1/2"
          exit={{ rotateX: "0deg" }}
          initial={{ rotateX: "180deg" }}
          key={(index + 1) * 2}
          style={{
            backfaceVisibility: "hidden",
            clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
            x: "-50%",
            y: "-50%",
            zIndex: index,
          }}
          transition={{
            duration: TRANSITION_DURATION_IN_SECS,
            ease: "easeInOut",
          }}
        >
          {items[index % items.length]}
        </motion.div>
      </AnimatePresence>

      <hr
        className="absolute top-1/2 right-0 left-0 z-[999999999] -translate-y-1/2 border-p3-border border-t-2"
        style={{
          transform: "translateZ(1px)",
        }}
      />
    </div>
  );
};

const LogoItem = ({ children, className }) => {
  return (
    <div
      className={cn(
        "grid h-36 w-52 place-content-center rounded-lg bg-p3-background text-6xl text-p3-text",
        className,
      )}
    >
      {children}
    </div>
  );
};

import { useId } from "react";

// Notion-style avatar. Pupils move by --pupil-x / --pupil-y (SVG user units)
// set on any ancestor; the white sticker outline comes from the filter.
const pupilStyle = {
  transform: "translate(var(--pupil-x, 0px), var(--pupil-y, 0px))",
  transition: "transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1)",
};

export default function Profile({ className }) {
  // Unique per instance so the outline filter never collides with another SVG.
  const filterId = `profile-outline-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 1080 1080"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          colorInterpolationFilters="linearRGB"
          filterUnits="objectBoundingBox"
          height="140%"
          id={filterId}
          primitiveUnits="userSpaceOnUse"
          width="140%"
          x="-20%"
          y="-20%"
        >
          <feMorphology in="SourceAlpha" operator="dilate" radius="20 20" result="morphology" />
          <feFlood floodColor="#ffffff" floodOpacity="1" result="flood" />
          <feComposite in="flood" in2="morphology" operator="in" result="composite" />
          <feMerge result="merge">
            <feMergeNode in="composite" result="mergeNode" />
            <feMergeNode in="SourceGraphic" result="mergeNode1" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} id="notion-avatar">
        <g fill="#ffffff" id="notion-avatar-face">
          <title>Face/ 7</title>
          <g
            fillRule="evenodd"
            id="Face/-7"
            stroke="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          >
            <path
              d="M532,379 C664.54834,379 772,486.45166 772,619 C772,751.54834 764.54834,919 572,919 C415.13263,919 351.668898,801.612202 313.752775,718.980575 L313.322946,718.989282 L312,719 C267.81722,719 232,683.18278 232,639 C232,599.134956 261.158843,566.080325 299.312086,560.00055 C325.599297,455.979213 419.809919,379 532,379 Z M295.858895,624.545187 L304.141105,655.454813"
              id="Path"
              stroke="#000000"
              strokeWidth="24"
            />
          </g>
        </g>
        <g id="notion-avatar-nose">
          <g id="Nose/ 11">
            <path
              clipRule="evenodd"
              d="M648.516 601C648.516 601 664.222 603.637 672 609.977C685.06 620.622 693.906 641.256 692.774 653.58C690.065 683.076 644 684.359 644 684.359C644 684.359 700 689.489 700 653.58C700 637.222 689.433 619.065 672 608.695C663.922 603.889 648.516 601 648.516 601Z"
              fill="black"
              fillRule="evenodd"
              id="Path"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
            />
          </g>
        </g>
        <g id="notion-avatar-mouth">
          <title>Mouth/ 0</title>
          <g
            fill="none"
            fillRule="evenodd"
            id="Mouth/-0"
            stroke="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          >
            <path
              d="M549,759 C576.33038,765.666667 599.663714,769 619,769 C638.336286,769 655.002953,765.666667 669,759"
              id="Path"
              stroke="#000000"
              strokeWidth="16"
            />
          </g>
        </g>
        <g id="notion-avatar-eyes">
          <title>Eyes/ 5</title>
          <g fill="none" fillRule="evenodd" id="Eyes/-5" stroke="none" strokeWidth="1">
            <g id="Group" transform="translate(538.000000, 507.000000)">
              <g transform="translate(138.000000, 0.000000)">
                <circle
                  cx="32"
                  cy="32"
                  id="Oval"
                  r="32"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="12"
                />
                <path
                  d="M4,18 C13.3333333,20.6666667 22.6666667,22 32,22 C41.3333333,22 50.6666667,20.6666667 60,18"
                  id="Path"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="12"
                />
                <circle cx="32" cy="28" fill="#000000" r="10" style={pupilStyle} />
              </g>
              <g transform="translate(0.000000, 1.000000)">
                <circle
                  cx="32"
                  cy="32"
                  id="Oval"
                  r="32"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="12"
                />
                <path
                  d="M4,18 C13.3333333,20.6666667 22.6666667,22 32,22 C41.3333333,22 50.6666667,20.6666667 60,18"
                  id="Path"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="12"
                />
                <circle cx="32" cy="28" fill="#000000" r="10" style={pupilStyle} />
              </g>
            </g>
          </g>
        </g>
        <g id="notion-avatar-eyebrows">
          <title>Eyebrows/ 3</title>
          <g
            fill="none"
            fillRule="evenodd"
            id="Eyebrows/-3"
            stroke="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          >
            <g
              id="Group"
              stroke="#000000"
              strokeWidth="24"
              transform="translate(512.000000, 484.000000)"
            >
              <path
                d="M152,14.0251712 C167.712271,3.95186377 182.349308,-0.695225271 195.911111,0.0839040908 C206.159229,0.672661315 219.876442,6.74452014 237.511111,14.0251712 C241.312508,15.5946162 247.475471,17.5862258 256,20"
                id="Path"
                transform="translate(204.000000, 10.000000) scale(-1, 1) translate(-204.000000, -10.000000) "
              />
              <path
                d="M0,14.0251712 C15.7122706,3.95186377 30.3493076,-0.695225271 43.9111111,0.0839040908 C54.1592293,0.672661315 67.8764421,6.74452014 85.5111111,14.0251712 C89.3125078,15.5946162 95.4754707,17.5862258 104,20"
                id="Path"
              />
            </g>
          </g>
        </g>
        <g id="notion-avatar-glasses">
          <title>Glasses/ 10</title>
          <g fill="none" fillRule="evenodd" id="Glasses/-10" stroke="none" strokeWidth="1">
            <g fill="#000000" id="Group" transform="translate(289.000000, 475.000000)">
              <rect height="23.4" id="Rectangle" width="300" x="201" y="0" />
              <path
                d="M329.571429,0 L370.642857,0 L370.642857,50.7333333 C363.797619,41.4888889 356.952381,36.8666667 350.107143,36.8666667 C343.261905,36.8666667 336.416667,41.4888889 329.571429,50.7333333 L329.571429,0 Z"
                id="Rectangle"
              />
              <path
                d="M209.035714,16.4666667 L226.635493,91.6470116 C228.329435,98.8829668 234.782715,104 242.214302,104 L295.809254,104 C302.413177,104 308.338607,99.9426587 310.726587,93.7856009 L340.714286,16.4666667 L340.714286,16.4666667 L209.035714,16.4666667 Z"
                id="Path"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="16"
              />
              <path
                d="M359.5,16.4666667 L377.099778,91.6470116 C378.793721,98.8829668 385.247,104 392.678588,104 L446.273539,104 C452.877463,104 458.802893,99.9426587 461.190872,93.7856009 L491.178571,16.4666667 L491.178571,16.4666667 L359.5,16.4666667 Z"
                id="Path"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="16"
                transform="translate(425.339286, 60.233333) scale(-1, 1) translate(-425.339286, -60.233333) "
              />
              <polygon
                id="Path"
                points="201 2 4 66 0 75 201 22"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </g>
          </g>
        </g>
        <g id="notion-avatar-hair">
          <g id="Hairstyle/ 48">
            <path
              clipRule="evenodd"
              d="M328.117 564.825L366 655C366 655 385.371 570.084 403 540C424.858 502.699 480 494 480 494C480 494 477.209 483.947 476 475C474.791 466.054 476 457 476 457L362 410L492 433C492 433 563.019 419.458 616 419C647.294 418.73 693 426 693 426C693 426 678 383 592 359C506 335 397 367 346 426C295 485 290 565 290 565L328.117 564.825Z"
              fill="black"
              fillRule="evenodd"
              id="Path"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="12"
            />
          </g>
        </g>
        <g id="notion-avatar-accessories">
          <title>Accessories/ 0</title>
          <g fill="none" fillRule="evenodd" id="Accessories/-0" stroke="none" strokeWidth="1" />
        </g>
        <g id="notion-avatar-details">
          <title>Details/ 0</title>
          <g fill="none" fillRule="evenodd" id="Details/-0" stroke="none" strokeWidth="1" />
        </g>
        <g id="notion-avatar-beard">
          <title>Beard/ 0</title>
          <g fill="none" fillRule="evenodd" id="Beard/-0" stroke="none" strokeWidth="1" />
        </g>
        <g id="notion-avatar-halloween">
          <ellipse
            cx="577"
            cy="619"
            fill="white"
            rx="211"
            ry="196"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="24"
          />
          <ellipse
            cx="707"
            cy="625.5"
            fill="black"
            rx="42"
            ry="58.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          <path
            clipRule="evenodd"
            d="M700 572.238C700 572.238 727.523 597.376 731.34 616.518C735.157 635.66 718.804 666.537 718.804 666.537C718.804 666.537 746.227 645.217 739.959 613.238C733.691 581.258 700 572.238 700 572.238Z"
            fill="white"
            fillRule="evenodd"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <ellipse
            cx="531"
            cy="625.5"
            fill="black"
            rx="42"
            ry="58.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          <path
            clipRule="evenodd"
            d="M524 572.238C524 572.238 551.523 597.376 555.34 616.518C559.157 635.66 542.804 666.537 542.804 666.537C542.804 666.537 570.227 645.217 563.959 613.238C557.691 581.258 524 572.238 524 572.238Z"
            fill="white"
            fillRule="evenodd"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            clipRule="evenodd"
            d="M627.08 670L616.019 713.993C614.603 719.625 619.47 724.842 625.187 723.819L645.386 720.204C650.952 719.207 653.756 712.907 650.77 708.105L627.08 670Z"
            fill="black"
            fillRule="evenodd"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          <path
            d="M596 765L606 809"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <path
            d="M638 752L649 799"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <path
            d="M681 743L692 787"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <path
            d="M366 624C366 624 339.189 605.338 304 592C268.811 578.662 242 577 242 577"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="24"
          />
        </g>
      </g>
    </svg>
  );
}

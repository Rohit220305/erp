const RadialSpinner = ({ sizeClass }) => {
  return (
    <svg 
      className={sizeClass}
      viewBox="0 0 320 320" 
      preserveAspectRatio="xMidYMid"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(160,160)">
        <circle cx="0" cy="0" r="140" fill="none" stroke="#e15b64" strokeWidth="16" strokeDasharray="659.7 219.9" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="0 0 0;360 0 0"></animateTransform>
        </circle>
        <circle cx="0" cy="0" r="110" fill="none" stroke="#abbd81" strokeWidth="16" strokeDasharray="518.4 172.8" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="45 0 0;405 0 0"></animateTransform>
        </circle>
        <circle cx="0" cy="0" r="80" fill="none" stroke="#f8b26a" strokeWidth="16" strokeDasharray="377.0 125.7" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="90 0 0;450 0 0"></animateTransform>
        </circle>
        <circle cx="0" cy="0" r="50" fill="none" stroke="#a0c8d7" strokeWidth="16" strokeDasharray="235.6 78.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="135 0 0;495 0 0"></animateTransform>
        </circle>
      </g>
    </svg>
  );
};

export default function Loader({ fullPage = false, overlay = false, inline = false, size }) {
  let defaultSize = "md";
  if (fullPage) defaultSize = "xl";
  if (overlay) defaultSize = "xl";
  if (inline) defaultSize = "sm";

  const activeSize = size || defaultSize;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-24 h-24",
    xl: "w-40 h-40"
  };

  const spinnerClass = sizeClasses[activeSize] || sizeClasses.md;
  if (inline) {
    return <div className={`inline-block align-middle`}><RadialSpinner sizeClass={spinnerClass} /></div>;
  }

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center ">
        <RadialSpinner sizeClass={spinnerClass} />
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center backdrop-blur-[1px]">
        <RadialSpinner sizeClass={spinnerClass} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <RadialSpinner sizeClass={spinnerClass} />
    </div>
  );
}

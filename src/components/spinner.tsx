export function Spinner({ visible, rounded = "none" }: { visible?: boolean, rounded?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full" }) {
    if (!visible) {
        return null;
    }
    return (
        <div className={"absolute inset-0 flex items-center justify-center bg-black/50 z-50" + (rounded === "none" ? "" : ` rounded-${rounded}`)}>
            <svg
                className="animate-spin h-8 w-8 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.93A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-3.008zM12 20a8.003 8.003 0 008-8h-4c0 2.21-1.79 4-4 4v4zm6.93-2.93A8.003 8.003 0 0020 12h4c0 3.042-1.135 5.824-3 7.938l-3.07-2.938zM20 12a8.003 8.003 0 00-8-8v4c2.21 0 4 1.79 4 4h4z"
                ></path>
            </svg>
        </div>
    );
}
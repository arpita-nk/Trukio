const base = (props) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...props
})

export const TruckIcon = (p) => (
  <svg {...base(p)}>
    <rect x="1" y="7" width="14" height="10" rx="1.5" />
    <path d="M15 10h3.5l3 3.5V17h-6.5" />
    <circle cx="6" cy="18.5" r="1.6" />
    <circle cx="17.5" cy="18.5" r="1.6" />
  </svg>
)

export const DocIcon = (p) => (
  <svg {...base(p)}>
    <path d="M6 2h8l5 5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V3.5A1.5 1.5 0 0 1 6.5 2z" />
    <path d="M14 2v5h5" />
  </svg>
)

export const CloudUploadIcon = (p) => (
  <svg {...base(p)}>
    <path d="M7 18a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 17 8.5a4 4 0 0 1 1 7.9" />
    <path d="M12 12v7" />
    <path d="M9 15l3-3 3 3" />
  </svg>
)

export const ListIcon = (p) => (
  <svg {...base(p)}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

export const GridIcon = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.2" />
    <rect x="14" y="3" width="7" height="7" rx="1.2" />
    <rect x="3" y="14" width="7" height="7" rx="1.2" />
    <rect x="14" y="14" width="7" height="7" rx="1.2" />
  </svg>
)

export const ShieldIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 2l8 3.5V11c0 5.5-3.5 8.7-8 10.5C7.5 19.7 4 16.5 4 11V5.5L12 2z" />
    <path d="M9 12l2 2 4-4.5" />
  </svg>
)

export const PackageIcon = (p) => (
  <svg {...base(p)}>
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
)

export const CheckCircleIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 5-5" />
  </svg>
)

export const RouteIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="6" cy="19" r="2.2" />
    <circle cx="18" cy="5" r="2.2" />
    <path d="M6 16.8V13a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4" />
  </svg>
)

export const SearchIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
)

export const CameraIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9z" />
    <circle cx="12" cy="13" r="3.4" />
  </svg>
)

export const PrintIcon = (p) => (
  <svg {...base(p)}>
    <path d="M7 8V3h10v5" />
    <rect x="4" y="8" width="16" height="8" rx="1.3" />
    <path d="M7 16h10v5H7z" />
  </svg>
)

export const MicIcon = (p) => (
  <svg {...base(p)}>
    <rect x="9" y="2.5" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
    <path d="M12 17.5V21M9 21h6" />
  </svg>
)

export const CloseIcon = (p) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const ArrowRightIcon = (p) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ClockIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" />
  </svg>
)

export const AlertIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 3l10 18H2L12 3z" />
    <path d="M12 10v4M12 17.5h.01" />
  </svg>
)

export const UserIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
)

export const XCircleIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
)

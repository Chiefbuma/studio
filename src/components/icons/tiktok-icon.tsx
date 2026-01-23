import type { SVGProps } from 'react';

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.52.02c1.31-.02 2.61.1 3.88.7a4.93 4.93 0 0 1 2.33 2.33c.6 1.27.71 2.57.7 3.88.02-1.31-.1-2.61-.7-3.88a4.93 4.93 0 0 0-2.33-2.33c-1.27-.6-2.57-.71-3.88-.7Z" />
      <path d="M16 4.12a4.93 4.93 0 0 1-2.33 2.33c-1.27.6-2.57.71-3.88.7A4.93 4.93 0 0 1 7.46 5.12a4.93 4.93 0 0 1-1.33-3.67C6.3 1.31 6.13 0 6.13 0" />
      <path d="M7.46 5.12A4.93 4.93 0 0 1 5.13 7.45c-.6 1.27-.71 2.57-.7 3.88s.1 2.61.7 3.88a4.93 4.93 0 0 1 2.33 2.33c1.27.6 2.57.71 3.88.7s2.61-.1 3.88-.7a4.93 4.93 0 0 1 2.33-2.33c.6-1.27.7-2.57.7-3.88" />
      <path d="M7.46 5.12v.01" />
      <path d="M16 4.12v.01" />
    </svg>
  );
}

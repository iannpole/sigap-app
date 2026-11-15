function Studs({ x, y, count, color }: { x: number; y: number; count: number; color: string }) {
  return Array.from({ length: count }, (_, i) => (
    <g key={i} transform={`translate(${x + i * 20} ${y})`}>
      <rect width="14" height="7" rx="2" fill={color} />
      <path d="M1 7h12v5H1z" fill={color} opacity=".65" />
    </g>
  ));
}

export default function BrickActivityLayer() {
  return (
    <svg viewBox="0 0 1440 230" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
      <g stroke="#1B2433" strokeWidth="4" strokeLinejoin="round">
        <g transform="translate(20 88)">
          <path d="M0 62h26V34h138v28h38l24 24v42H0z" fill="#FFFFFF" />
          <path d="M18 62h172l22 24H18z" fill="#C8261E" stroke="none" opacity=".9" />
          <path d="M108 46v28M94 60h28" stroke="#FFFFFF" strokeWidth="9" />
          <Studs x={38} y={22} count={6} color="#C8261E" />
          <circle cx="50" cy="130" r="22" fill="#1B2433" />
          <circle cx="172" cy="130" r="22" fill="#1B2433" />
          <circle cx="50" cy="130" r="9" fill="#FFFFFF" stroke="none" />
          <circle cx="172" cy="130" r="9" fill="#FFFFFF" stroke="none" />
        </g>

        <g transform="translate(286 64)">
          <rect x="0" y="72" width="190" height="88" fill="#1F5FD1" />
          <rect x="20" y="34" width="150" height="40" fill="#FFFFFF" />
          <Studs x={32} y={22} count={6} color="#1F5FD1" />
          <rect x="72" y="96" width="46" height="64" fill="#FFFFFF" />
          <rect x="22" y="92" width="32" height="30" fill="#FFFFFF" />
          <rect x="136" y="92" width="32" height="30" fill="#FFFFFF" />
          <path d="M95 34V15M82 15h26" />
        </g>

        <g transform="translate(530 74)">
          <circle cx="48" cy="30" r="22" fill="#F5C400" />
          <Studs x={31} y={3} count={2} color="#F5C400" />
          <rect x="26" y="54" width="44" height="76" fill="#1B7F37" />
          <rect x="6" y="60" width="20" height="68" fill="#F5C400" />
          <rect x="70" y="60" width="20" height="68" fill="#F5C400" />
          <rect x="28" y="130" width="18" height="54" fill="#1B2433" />
          <rect x="50" y="130" width="18" height="54" fill="#1B2433" />
          <circle cx="132" cy="146" r="31" fill="#FFFFFF" />
          <path d="M132 115v62M101 146h62" />
        </g>

        <g transform="translate(1040 64)">
          <rect x="0" y="72" width="250" height="94" fill="#1B7F37" />
          <rect x="24" y="34" width="202" height="40" fill="#FFFFFF" />
          <Studs x={42} y={22} count={8} color="#1B7F37" />
          <path d="M125 42v25M112 54h26" stroke="#C8261E" strokeWidth="9" />
          <rect x="24" y="94" width="44" height="34" fill="#B8EEDE" />
          <rect x="182" y="94" width="44" height="34" fill="#B8EEDE" />
          <rect x="96" y="104" width="58" height="62" fill="#FFFFFF" />
        </g>

        <g transform="translate(1340 92)">
          <circle cx="28" cy="26" r="20" fill="#F5C400" />
          <Studs x={15} y={1} count={2} color="#F5C400" />
          <rect x="9" y="48" width="38" height="70" fill="#C8261E" />
          <rect x="11" y="118" width="15" height="48" fill="#1B2433" />
          <rect x="30" y="118" width="15" height="48" fill="#1B2433" />
        </g>
      </g>

      <g opacity=".35">
        <Studs x={690} y={182} count={14} color="#1F5FD1" />
        <Studs x={720} y={204} count={12} color="#1B7F37" />
      </g>
    </svg>
  );
}

import { ImageResponse } from 'next/og';
import { profile } from '../lib/content';

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const green = '#33ff66';
const glow = `0 0 4px ${green}, 0 0 18px rgba(51, 255, 102, 0.6)`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: green,
          fontFamily: 'monospace',
          backgroundColor: '#020a04',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 5px), radial-gradient(ellipse at center, rgba(51,255,102,0.10) 0%, transparent 70%)',
        }}
      >
        <div style={{ fontSize: 34, opacity: 0.7, textShadow: glow }}>
          {`guest@${profile.handle}:~$ whoami`}
        </div>
        <div style={{ fontSize: 92, marginTop: 28, textShadow: glow }}>{profile.name}</div>
        <div style={{ fontSize: 40, marginTop: 16, textShadow: glow }}>{profile.role}</div>
        <div style={{ display: 'flex', fontSize: 34, marginTop: 48, opacity: 0.7, textShadow: glow }}>
          {`guest@${profile.handle}:~$ `}
          <div style={{ width: 20, height: 38, marginLeft: 8, backgroundColor: green }} />
        </div>
      </div>
    ),
    size
  );
}

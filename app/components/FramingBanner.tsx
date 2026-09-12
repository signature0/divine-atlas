import { Culture } from '../lib/types';

export function FramingBanner({ culture }: { culture: Culture }) {
  return (
    <div className="framing">
      <span className="eyebrow">{culture.framing}</span>
      <p className="small muted" style={{ margin: 0 }}>{culture.framing_note}</p>
    </div>
  );
}

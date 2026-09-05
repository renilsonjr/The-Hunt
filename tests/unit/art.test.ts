import { describe, it, expect } from 'vitest';
import { ART, ART_IDS } from '~/data/art';

describe('art manifest', () => {
  it('contains all 22 plates', () => {
    expect(ART_IDS).toHaveLength(22);
  });

  it('has unique ids', () => {
    expect(new Set(ART_IDS).size).toBe(ART_IDS.length);
  });

  it('has non-empty alt text in both locales for every plate', () => {
    for (const id of ART_IDS) {
      const entry = ART[id];
      expect(entry.alt.en.length, `${id} en alt`).toBeGreaterThan(10);
      expect(entry.alt.pt.length, `${id} pt alt`).toBeGreaterThan(10);
    }
  });

  it('has a title in both locales for every plate', () => {
    for (const id of ART_IDS) {
      expect(ART[id].title.en.length, `${id} en title`).toBeGreaterThan(0);
      expect(ART[id].title.pt.length, `${id} pt title`).toBeGreaterThan(0);
    }
  });

  it('points every entry at a real imported image with dimensions', () => {
    for (const id of ART_IDS) {
      expect(ART[id].src.width, `${id} width`).toBeGreaterThan(0);
      expect(ART[id].src.height, `${id} height`).toBeGreaterThan(0);
    }
  });
});

'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { InventoryItemStatus, NigerianFoodCategory, UserInventoryItem } from '@/types/mealPlanner';
import { NIGERIAN_FOOD_CATEGORIES, NIGERIAN_FOOD_DATABASE } from '@/data/nigerianFoods';
import { FlowTitle } from '@/components/flow/FlowShell';
import { Chip, ChipScroller } from '@/components/flow/controls';

const SHORT_CATEGORY: Record<NigerianFoodCategory, string> = {
  staples_carbs: 'Staples',
  proteins_meat_fish: 'Protein',
  vegetables_soups_fats: 'Veg and soups',
  fruits_snacks_nuts: 'Fruit and snacks',
};

const STATES: { value: InventoryItemStatus; label: string; on: string }[] = [
  { value: 'in_stock', label: 'Have', on: 'bg-gym-lime text-gym-ink' },
  { value: 'to_buy', label: 'Buy', on: 'bg-white text-gym-ink' },
  { value: 'excluded', label: 'Skip', on: 'bg-white/25 text-gym-text' },
];

export const statusOf = (inventory: UserInventoryItem[], foodId: string): InventoryItemStatus =>
  inventory.find((i) => i.foodId === foodId)?.status ?? 'to_buy';

interface KitchenStepProps {
  inventory: UserInventoryItem[];
  onChange: (foodId: string, status: InventoryItemStatus) => void;
}

export function KitchenStep({ inventory, onChange }: KitchenStepProps) {
  const [category, setCategory] = useState<NigerianFoodCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const foods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NIGERIAN_FOOD_DATABASE.filter((f) => {
      if (category !== 'all' && f.category !== category) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q) || Boolean(f.localName?.toLowerCase().includes(q));
    });
  }, [category, query]);

  return (
    <>
      <FlowTitle title="What's in your kitchen?" sub="Have it, buy it, or leave it out." />
      <label className="glass-inset relative mb-3 flex h-12 items-center rounded-full border border-white/15">
        <span className="sr-only">Search foods</span>
        <Search className="pointer-events-none absolute left-4 h-[18px] w-[18px] text-gym-textMuted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rice, titus, semo, ugwu"
          className="h-full min-w-0 flex-1 rounded-full border-0 bg-transparent pl-11 pr-4 text-[15px] text-gym-text outline-none placeholder:text-gym-textMuted"
        />
      </label>
      <ChipScroller label="Food type" role="radiogroup">
        <Chip role="radio" variant="white" selected={category === 'all'} onClick={() => setCategory('all')}>
          All
        </Chip>
        {NIGERIAN_FOOD_CATEGORIES.map((c) => (
          <Chip key={c.id} role="radio" variant="white" selected={category === c.id} onClick={() => setCategory(c.id)}>
            {SHORT_CATEGORY[c.id]}
          </Chip>
        ))}
      </ChipScroller>

      <ul className="mt-3 flex flex-col gap-2">
        {foods.map((f) => {
          const status = statusOf(inventory, f.id);
          const skipped = status === 'excluded';
          const sub = f.localName && f.localName.toLowerCase() !== f.name.toLowerCase() ? f.localName : SHORT_CATEGORY[f.category];
          return (
            <li
              key={f.id}
              className={`flex min-h-[68px] items-center gap-2.5 rounded-[26px] py-2 pl-[18px] pr-2 transition-colors ${
                skipped ? 'glass-inset border border-white/10' : 'glass'
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className={`line-clamp-2 block text-[15px] font-semibold leading-snug ${skipped ? 'text-white/70 line-through' : 'text-gym-text'}`}>{f.name}</span>
                <span className="block truncate text-[13px] text-gym-textMuted">
                  {sub}
                  {skipped ? ' · left out' : ''}
                </span>
              </span>
              <span role="radiogroup" aria-label={f.name} className="glass-inset flex shrink-0 rounded-full p-[3px]">
                {STATES.map((s) => {
                  const on = s.value === status;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onChange(f.id, s.value)}
                      className={`h-11 w-12 rounded-full text-[13px] transition-colors active:scale-95 ${
                        on ? `${s.on} font-bold` : 'font-semibold text-white/85'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </span>
            </li>
          );
        })}
        {foods.length === 0 && <li className="py-10 text-center text-sm text-gym-textMuted">Nothing matches that search.</li>}
      </ul>
    </>
  );
}

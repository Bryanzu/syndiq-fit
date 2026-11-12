'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Switch } from '@/components/flow/controls';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_LIBRARY } from '@/data/equipment';
import { EquipmentCategory, SyndiqEquipmentId } from '@/types/equipment';

const SHORT_CATEGORY: Partial<Record<EquipmentCategory, string>> = {
  free_weights: 'Free weights',
  benches_racks: 'Benches and racks',
  machines: 'Machines',
  cables: 'Cables',
  bodyweight_functional: 'Bodyweight',
  cardio: 'Cardio',
};

interface EquipmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: SyndiqEquipmentId[];
  onChange: (equipment: SyndiqEquipmentId[]) => void;
}

export function EquipmentSheet({ isOpen, onClose, equipment, onChange }: EquipmentSheetProps) {
  const [category, setCategory] = useState<EquipmentCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EQUIPMENT_LIBRARY.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        Boolean(item.aliases?.some((a) => a.toLowerCase().includes(q)))
      );
    });
  }, [category, query]);

  const toggle = (id: SyndiqEquipmentId, on: boolean) =>
    onChange(on ? [...equipment.filter((e) => e !== 'bodyweight_only'), id] : equipment.filter((e) => e !== id));

  return (
    <Sheet isOpen={isOpen} onClose={onClose} labelledBy="equipment-sheet-title" zClass="z-[110]" maxWidth="max-w-lg">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 space-y-3 bg-gym-card px-4 pb-3 pt-2">
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 id="equipment-sheet-title" className="text-2xl font-bold tracking-tight text-gym-text">
              Your equipment
            </h2>
            <button type="button" onClick={onClose} className="btn-primary px-5">
              Done
            </button>
          </div>
          <label className="relative block">
            <span className="sr-only">Search equipment</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gym-textMuted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search equipment"
              className="field rounded-full pl-11"
            />
          </label>
          <div role="radiogroup" aria-label="Equipment type" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {[{ id: 'all' as const, label: 'All' }, ...EQUIPMENT_CATEGORIES.map((c) => ({ id: c.id, label: SHORT_CATEGORY[c.id] ?? c.label }))].map(
              (c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={`tab shrink-0 ${category === c.id ? 'tab-active' : 'bg-gym-cardInner'}`}
                >
                  {c.label}
                </button>
              )
            )}
          </div>
        </div>

        <ul className="modal-content-scroll divide-line min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {items.map((item) => {
            const on = equipment.includes(item.id);
            return (
              <li key={item.id} className="flex min-h-[60px] items-center justify-between gap-4 py-2">
                <span className="text-[15px] font-medium text-gym-text">{item.name}</span>
                <Switch label={item.name} checked={on} onChange={(v) => toggle(item.id, v)} />
              </li>
            );
          })}
          {items.length === 0 && <li className="py-10 text-center text-sm text-gym-textMuted">Nothing matches that search.</li>}
        </ul>
      </div>
    </Sheet>
  );
}

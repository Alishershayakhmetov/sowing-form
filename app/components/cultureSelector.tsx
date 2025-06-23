'use client'

import { useState } from 'react'

const cultures: Record<string, string[]> = {
  "Зерновые и зернобобовые": [
    "Горох", "Гречиха", "Зернобобовые", "Нут", "Овес", "Озимые", "Просо",
    "Пшеница", "Смесь Клососовых", "Чечевица", "Ячмень"
  ],
  "Картофель и Овощи": ["Картофель", "Овощи"],
  "Кормовые": ["Кормовые", "Кукуруза на Зерно", "Кукуруза на Силос", "Многолетние Травы", "Однолетние Травы"],
  "Масличные": ["Горчица", "Лен", "Подсолнечник", "Прочие Масличные", "Рапс", "Рыжик", "Сафлор", "Соя"],
  "Пар": ["Пар"]
}

export default function CultureSelector({
  onChange,
  initialSelected = []
}: {
  onChange: (selected: [string, string][]) => void
  initialSelected?: [string, string][]
}) {
  const [selected, setSelected] = useState<[string, string][]>(initialSelected)

  const toggleSubculture = (category: string, sub: string) => {
    const key: [string, string] = [category, sub]
    const exists = selected.some(([cat, s]) => cat === category && s === sub)

    const updated = exists
      ? selected.filter(([cat, s]) => !(cat === category && s === sub))
      : [...selected, key]

    setSelected(updated)
    onChange(updated)
  }

  const isChecked = (category: string, sub: string) =>
    selected.some(([cat, s]) => cat === category && s === sub)

  return (
    <div className="space-y-4">
      {Object.entries(cultures).map(([category, subs]) => (
        <div key={category}>
          <h3 className="font-semibold">{category}</h3>
          <div className="pl-4 grid grid-cols-2 gap-2">
            {subs.map(sub => (
              <label key={sub} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isChecked(category, sub)}
                  onChange={() => toggleSubculture(category, sub)}
                />
                {sub}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

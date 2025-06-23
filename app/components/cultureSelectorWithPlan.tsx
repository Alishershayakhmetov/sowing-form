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

type SelectedCulture = {
  culture: string
  subculture: string
  plan: number
}

export default function CultureSelectorWithPlan({
  onChange,
  initialSelected = []
}: {
  onChange: (selected: SelectedCulture[]) => void
  initialSelected?: SelectedCulture[]
}) {
  const [selected, setSelected] = useState<SelectedCulture[]>(initialSelected)

  const toggleSubculture = (culture: string, sub: string) => {
    const exists = selected.find(item => item.culture === culture && item.subculture === sub)
    let updated: SelectedCulture[]

    if (exists) {
      updated = selected.filter(item => !(item.culture === culture && item.subculture === sub))
    } else {
      updated = [...selected, { culture, subculture: sub, plan: 0 }]
    }

    setSelected(updated)
    onChange(updated)
  }

  const updatePlan = (culture: string, sub: string, input: string) => {
    const numericPlan = input === '' ? 0 : parseFloat(input)
    const updated = selected.map(item =>
      item.culture === culture && item.subculture === sub
        ? { ...item, plan: isNaN(numericPlan) ? 0 : numericPlan }
        : item
    )
    setSelected(updated)
    onChange(updated)
  }

  const isChecked = (culture: string, sub: string) =>
    selected.some(item => item.culture === culture && item.subculture === sub)

  // const getPlan = (category: string, sub: string) => {
  //   const value = selected.find(item => item.category === category && item.subculture === sub)?.plan
  //   return value === 0 ? '' : String(value)
  // }

  const getPlan = (culture: string, sub: string) => {
    const value = selected.find(item => item.culture === culture && item.subculture === sub)?.plan
    return value !== undefined ? String(value) : ''
  }


  return (
    <div className="space-y-6">
      {Object.entries(cultures).map(([category, subs]) => (
        <div key={category}>
          <h3 className="font-semibold mb-2">{category}</h3>
          <div className="pl-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
            {subs.map(sub => {
              const checked = isChecked(category, sub)
              return (
                <div
                  key={sub}
                  className="flex items-center justify-between border border-gray-200 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubculture(category, sub)}
                    />
                    <span>{sub}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    placeholder="План"
                    value={checked ? getPlan(category, sub) : ''}
                    onChange={e =>
                      updatePlan(category, sub, e.target.value)
                    }
                    className="w-24 px-2 py-1 border rounded text-sm disabled:opacity-50"
                    disabled={!checked}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}


/*
console
{
    "login": "test",
    "name": "test",
    "surname": "test",
    "phoneNumber": "test",
    "company": "test",
    "region": "test",
    "district": "test",
    "ruralDistrict": "test",
    "village": "test",
    "crops": [
        {
            "category": "Зерновые и зернобобовые",
            "subculture": "Горох",
            "plan": 5768
        },
        {
            "category": "Зерновые и зернобобовые",
            "subculture": "Озимые",
            "plan": 0
        },
        {
            "category": "Зерновые и зернобобовые",
            "subculture": "Чечевица",
            "plan": 22
        },
        {
            "category": "Картофель и Овощи",
            "subculture": "Овощи",
            "plan": 5
        },
        {
            "category": "Масличные",
            "subculture": "Лен",
            "plan": 0
        },
        {
            "category": "Пар",
            "subculture": "Пар",
            "plan": 44
        }
    ]
}

*/

/*
network

{
    "login": "test",
    "name": "test",
    "surname": "test",
    "phoneNumber": "test",
    "company": "test",
    "region": "test",
    "district": "test",
    "ruralDistrict": "test",
    "village": "test",
    "crops": [
        {
            "category": "Зерновые и зернобобовые",
            "subculture": "Горох",
            "plan": 5768
        },
        {
            "category": "Зерновые и зернобобовые",
            "subculture": "Озимые",
            "plan": 0
        },
        {
            "category": "Зерновые и зернобобовые",
            "subculture": "Чечевица",
            "plan": 22
        },
        {
            "category": "Картофель и Овощи",
            "subculture": "Овощи",
            "plan": 5
        },
        {
            "category": "Масличные",
            "subculture": "Лен",
            "plan": 0
        },
        {
            "category": "Пар",
            "subculture": "Пар",
            "plan": 44
        }
    ]
}


*/
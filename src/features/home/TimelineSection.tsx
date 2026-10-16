import { useMemo } from 'react'
import { useContent } from '../../content/useContent'
import { selectTimeline } from '../../content/selectors'
import { formatYearMonthRange } from '../../lib/date'
import { Badge, TagList } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionHeading } from '../../components/SectionHeading'

/** 教育及个人经历时间线（F-03 / AC-F03）：开始时间倒序，结束时间为空显示"至今" */
export function TimelineSection() {
  const { state } = useContent()
  const items = useMemo(() => selectTimeline(state), [state])

  return (
    <section id="timeline" aria-labelledby="timeline-title" className="scroll-mt-24">
      <SectionHeading eyebrow="成长路径" id="timeline-title" title="教育与经历" />

      {items.length === 0 ? (
        <EmptyState
          title="还没有经历记录"
          description="在后台「个人信息 → 经历时间线」新增第一条，这里会按时间顺序展示。"
        />
      ) : (
        <ol className="relative space-y-6 border-l border-ink-700 pl-6">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span
                aria-hidden="true"
                className={[
                  'absolute top-2 -left-[1.9rem] h-3 w-3 rounded-full border-2',
                  item.kind === 'education'
                    ? 'border-champagne-400 bg-ink-900'
                    : 'border-parchment-500 bg-ink-900',
                ].join(' ')}
              />
              <div className="rounded-card border border-ink-700 bg-ink-800 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Badge tone={item.kind === 'education' ? 'accent' : 'neutral'}>
                    {item.kind === 'education' ? '教育' : '经历'}
                  </Badge>
                  <p className="text-xs text-parchment-500 tabular-nums">
                    {formatYearMonthRange(item.startDate, item.endDate)}
                  </p>
                </div>
                <h3 className="mt-2 text-base font-semibold text-parchment-100">{item.title}</h3>
                {item.role.length > 0 ? (
                  <p className="mt-1 text-sm text-parchment-300">{item.role}</p>
                ) : null}
                {item.description.length > 0 ? (
                  <p className="mt-2 text-sm leading-6 text-parchment-300">{item.description}</p>
                ) : null}
                {item.tags.length > 0 ? (
                  <div className="mt-3">
                    <TagList items={item.tags} label={`${item.title}的标签`} />
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

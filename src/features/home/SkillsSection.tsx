import { useMemo } from 'react'
import { useContent } from '../../content/useContent'
import { selectSkillGroups } from '../../content/selectors'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionHeading } from '../../components/SectionHeading'

/** 熟练度可视化：5 格，其中前 level 格为香槟金（非文本指示对比度 > 3:1） */
function LevelIndicator({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`熟练度 ${level} / 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={[
            'h-1.5 w-4 rounded-full',
            step <= level ? 'bg-champagne-400' : 'bg-ink-600',
          ].join(' ')}
        />
      ))}
    </span>
  )
}

/** 技能分类展示（F-02 / AC-F02）：按分类分组，空分类不渲染 */
export function SkillsSection() {
  const { state } = useContent()
  const groups = useMemo(() => selectSkillGroups(state), [state])

  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-24">
      <SectionHeading
        eyebrow="能力范围"
        id="skills-title"
        title="技能"
        description="按分类列出正在使用与持续打磨的技能，右侧为自评熟练度。"
      />

      {groups.length === 0 ? (
        <EmptyState
          title="暂无技能数据"
          description="登录后台的「技能」页面新增第一个分类与技能，这里会立即显示。"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.category.id} as="section" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-parchment-100">
                  {group.category.name}
                </h3>
                <Badge tone="muted">{group.skills.length} 项</Badge>
              </div>
              <ul className="space-y-4">
                {group.skills.map((skill) => (
                  <li key={skill.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-parchment-100">{skill.name}</span>
                      <LevelIndicator level={skill.level} />
                    </div>
                    {skill.description.length > 0 ? (
                      <p className="mt-1 text-xs leading-5 text-parchment-500">
                        {skill.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

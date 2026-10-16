import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { PageHeader } from '../../../components/PageHeader'
import { CategoryPanel } from './CategoryPanel'
import { SkillPanel } from './SkillPanel'

/** 技能管理（F-16）：分类与技能两个区域 */
export function SkillsPage() {
  useDocumentTitle('技能管理')

  return (
    <div className="space-y-6">
      <PageHeader
        title="技能管理"
        description="技能按分类分组展示在首页。分类决定分组顺序，技能顺序决定分类内的排列。"
      />
      <CategoryPanel />
      <SkillPanel />
    </div>
  )
}

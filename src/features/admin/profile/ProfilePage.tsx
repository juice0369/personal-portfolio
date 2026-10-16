import { useState } from 'react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { PageHeader } from '../../../components/PageHeader'
import { Tabs } from '../../../components/ui/Tabs'
import { ProfileForm } from './ProfileForm'
import { TimelineManager } from './TimelineManager'

const TABS = [
  { id: 'profile', label: '个人资料' },
  { id: 'timeline', label: '经历时间线' },
] as const

/** 个人信息管理（F-15）：「个人资料」与「经历时间线」两个标签页 */
export function ProfilePage() {
  const [tab, setTab] = useState<string>('profile')
  useDocumentTitle('个人信息')

  return (
    <div>
      <PageHeader
        title="个人信息"
        description="这里的内容会出现在首页首屏、联系方式区块以及页脚。保存后前台无需刷新即可看到。"
      />

      <Tabs
        label="个人信息分区"
        value={tab}
        onChange={setTab}
        items={TABS.map((item) => ({
          id: item.id,
          label: item.label,
          content:
            item.id === 'profile' ? (
              <ProfileForm />
            ) : (
              <div className="max-w-3xl">
                <TimelineManager />
              </div>
            ),
        }))}
      />
    </div>
  )
}

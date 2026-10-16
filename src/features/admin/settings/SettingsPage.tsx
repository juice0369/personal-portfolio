import { useState } from 'react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { PageHeader } from '../../../components/PageHeader'
import { Tabs } from '../../../components/ui/Tabs'
import { DataTransferPanel } from './DataTransferPanel'
import { ResumeManager } from './ResumeManager'
import { SiteSettingsForm } from './SiteSettingsForm'

const TABS = [
  { id: 'site', label: '站点设置' },
  { id: 'resume', label: '简历文件' },
  { id: 'data', label: '数据管理' },
] as const

/** 站点设置（F-19、F-20）：站点信息、简历文件、数据导入导出三个面板 */
export function SettingsPage() {
  const [tab, setTab] = useState<string>('site')
  useDocumentTitle('站点设置')

  return (
    <div>
      <PageHeader
        title="站点设置"
        description="站点标题、页脚文案、星空背景与博客分页在这里调整；简历文件与数据备份在另外两个面板。保存后前台无需刷新即可看到变化。"
      />

      <Tabs
        label="站点设置分区"
        value={tab}
        onChange={setTab}
        items={TABS.map((item) => ({
          id: item.id,
          label: item.label,
          content:
            item.id === 'site' ? (
              <div className="max-w-3xl">
                <SiteSettingsForm />
              </div>
            ) : item.id === 'resume' ? (
              <ResumeManager />
            ) : (
              <div className="max-w-3xl">
                <DataTransferPanel />
              </div>
            ),
        }))}
      />
    </div>
  )
}

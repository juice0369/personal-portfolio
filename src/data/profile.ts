import { profileSchema, type Profile } from '../lib/schema'

/**
 * 内置默认个人资料（内容来源：`周毅个人简历（大连海事大学27届）.pdf`）。
 * 通过 schema.parse 做一次“走私校验”：字段写错会在加载时立刻暴露。
 *
 * 隐私口径（对应 AGENTS.md §6.2）：只写入本人愿意公开的信息——姓名、公开邮箱、
 * GitHub 主页、就读院校与专业、教育与项目经历。简历中的手机号、所在城市、详细住址、
 * 出生年月等一律不进入默认数据，需要时由使用者自行在 `/admin/profile` 中填写（仅存于本机浏览器）。
 */
export const profile: Profile = profileSchema.parse({
  name: '周毅',
  headline: '计算机科学与技术 · 目标检测与模型轻量化',
  bio: '大连海事大学信息科学技术学院计算机科学与技术专业2023级本科生，前六学期平均绩点3.97/5.00，通过英语四、六级。围绕水下目标检测以第一作者身份发表一篇论文。在竞赛方面，获国家级、省部级奖项多项，具备扎实的专业能力。',
  avatarAssetId: null,
  email: '605446153@qq.com',
  phone: '',
  location: '',
  socials: [
    {
      id: 'social-github',
      label: 'GitHub',
      url: 'https://github.com/juice0369',
      icon: 'github',
    },
  ],
  updatedAt: '2026-10-16T00:00:00.000Z',
})

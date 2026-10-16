import { timelineItemSchema, type TimelineItem } from '../lib/schema'

/**
 * 教育与经历时间线（内容来源：`周毅个人简历（大连海事大学27届）.pdf`）。
 * 只保留教育经历一条；排名、奖学金与荣誉不出现在前台。
 */
export const timeline: TimelineItem[] = [
  {
    id: 'timeline-dlmu',
    kind: 'education',
    title: '大连海事大学 · 计算机科学与技术',
    role: '2023 级本科生',
    startDate: '2023-09',
    endDate: '2027-06',
    description: '',
    tags: [],
    order: 0,
  },
].map((item) => timelineItemSchema.parse(item))

import { useContent } from '../content/useContent'

/**
 * 星空背景（F-19 的开关、X-05 的动效偏好）。
 *
 * 纯 CSS 实现（样式见 index.css 的 .starfield 系列），没有动画循环：
 * 仅在允许动效时对光晕层做一次极慢的透明度呼吸。
 * 组件本身是装饰性的：pointer-events-none + aria-hidden，且不接收鼠标事件，
 * 正文与表单始终位于不透明面板之上，因此不会影响对比度。
 */
export function Starfield() {
  const { state } = useContent()

  if (!state.settings.starfieldEnabled) return null

  return (
    <div className="starfield" aria-hidden="true">
      <div className="starfield-glow" />
      <div className="starfield-dots" />
    </div>
  )
}

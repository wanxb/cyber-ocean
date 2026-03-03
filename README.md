# Cyber Ocean (赛博深海鱼缸)

基于 Canvas 的简单海底动画。运行方式灵活，既可当作演示也可放在
Github Pages，上手快速。

## 结构

```
index.html        入口
css/style.css     样式
js/               逻辑模块（utils、prop、spotlight、creature、main）
js/bundle.js      全部代码的单文件版本
```

## 特性

- 多种生物：鲸鱼、鲨鱼、海龟、鱼、水母、海马。
- 聚光灯自动跟踪大目标；画布可点击生成生物。
- 海藻、珊瑚会摆动；支持窗口大小变化。
- 修正了鲸鱼的绘制偏移问题。

## 使用

1. 克隆仓库。
2. 启动静态服务器或直接双击 `index.html`。

> `bundle.js` 版本可免服务器。所有资源使用相对路径，适合
> GitHub Pages 部署。

## 扩展建议

可添加更多生物、优化性能、编写测试或迁移到 WebGL。

## 版本

- v2.1：模块化、增添水母/海马、鲸鱼修复。
- v2.2：提供免服务器的 `bundle.js`。

欢迎 fork 并提交 PR，一起完善这个“赛博深海鱼缸”。

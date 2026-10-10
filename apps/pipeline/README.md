# EnglishReader - Data Pipeline (`apps/pipeline`)

Python 数据清洗与离线词典处理流水线。

## 功能特性
1. **ECDICT 77万词条离线词库构建**：
   - 自动拉取 skywind3000 开源 ECDICT 词典与英文 Lemmatization 词形还原映射集；
   - 编译为高度紧凑、毫秒级索引的 SQLite 数据库 `apps/web/data/dict.db`；
   - 覆盖中考、高考、四六级（CET-4/6）、考研、雅思、托福、GRE 标签体系。

## 使用方式

在项目根目录下执行：
```bash
npm run setup:dict
```
或直接运行 Python 脚本：
```bash
python3 apps/pipeline/prepare_dict.py
```
生成的 `dict.db` 存放在 `apps/web/data/dict.db`，由 Web 前端通过 Node.js 原生 `node:sqlite` 进行高性能无额外依赖的离线查询。

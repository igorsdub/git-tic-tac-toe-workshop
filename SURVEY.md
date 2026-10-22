# A Few Questions Before the Workshop / ワークショップ前の簡単な質問

Please tick any choices that fit your experience; it is fine to leave a question blank. These answers help the instructor prepare examples for the group. See the [Pre-session checklist](PRE_SESSION_CHECK.md) before the workshop.<br>
<span lang="ja">ご経験に当てはまる項目にすべてチェックしてください。質問を空欄にしてもかまいません。回答をもとに、講師が当日の例を準備します。ワークショップ前に[事前準備のチェックリスト](PRE_SESSION_CHECK.md)をご確認ください。</span>

1. **Which of these sound like your regular work?**<br>
   <span lang="ja">普段の仕事で、次のようなことをしていますか？</span>
   - Organizing data, making tables, or analyzing results in tools such as Excel, Prism, or Geneious.<br>
     <span lang="ja">Excel、Prism、Geneiousなどのツールで、データを整理したり、表を作成したり、結果を解析したりする。</span>
   - Editing files in applications such as RStudio, VS Code, or PyCharm.<br>
     <span lang="ja">RStudio、VS Code、PyCharmなどのアプリケーションでファイルを編集する。</span>
   - Running tools or commands in a terminal.<br>
     <span lang="ja">ターミナルやコマンドラインで、ツールを実行したりコマンドを入力したりする。</span>

2. **How do you keep track of changes to research files?**<br>
   <span lang="ja">研究ファイルの変更履歴をどのように管理していますか？</span>
   - Renamed copies, such as `analysis_v2`, `analysis_final`, or `analysis_final_revised`.<br>
     <span lang="ja">`analysis_v2`、`analysis_final`、`analysis_final_revised`のように、ファイル名を変えたコピーを保存する。</span>
   - Version history in a shared document or cloud storage, such as Google Drive or Word.<br>
     <span lang="ja">Google DriveやWordなど、共有ドキュメントやクラウドストレージの変更履歴を使う。</span>
   - Git or another version-control system.<br>
     <span lang="ja">Gitなどのバージョン管理システムを使う。</span>

3. **How do you usually work on files with other people?**<br>
   <span lang="ja">他の人とファイルを扱うとき、普段どのように共同作業していますか？</span>
   - Sending revised copies by email or chat.<br>
     <span lang="ja">メールやチャットで修正版を送り合う。</span>
   - Working together in a shared Google Doc, Word document, or other cloud document.<br>
     <span lang="ja">共有のGoogleドキュメント、Word文書、その他のクラウド文書を一緒に編集する。</span>
   - Collaborating through a shared GitHub repository or another version-control system.<br>
     <span lang="ja">共有GitHubリポジトリや他のバージョン管理システムを使って共同作業する。</span>

4. **How have you used an AI coding assistant?**<br>
   <span lang="ja">AIコーディングアシスタントをどのように使ったことがありますか？</span>
   - Asking for explanations or copying suggested code.<br>
     <span lang="ja">説明を尋ねたり、提案されたコードをコピーしたりする。</span>
   - Accepting code suggestions while editing.<br>
     <span lang="ja">編集中にコードの候補を受け入れる。</span>
   - Delegating file edits to an agent.<br>
     <span lang="ja">エージェントにファイルの編集を依頼する。</span>

5. **Optional: Is there anything you’d like to make easier in your day-to-day work?**<br>
   <span lang="ja">任意：日々の仕事で、もう少し楽にできたらと思うことはありますか？</span>

---

## Status and proposed additions (maintainer notes)

The SOKENDAI survey is live; its link is the `surveyUrl` in `docs/workshops.json` and appears on the Setup page. The five questions above are the intended text of that form. RIKEN has no survey link yet.

The RIKEN organiser drafted a ten-question survey in [`planning/riken-2026-11-10/survey-questions.md`](planning/riken-2026-11-10/survey-questions.md) (bilingual). Keep one survey text, here. The RIKEN questions are recorded below as proposed additions; none is live.

| RIKEN draft question | Relation to the questions above |
|---|---|
| 1. Which programming language are you most comfortable with? (Python, R, Julia, MATLAB, other) | New |
| 2. Which of these sounds like your regular work? (choose one) | Overlaps question 1; the draft is single choice and shorter |
| 3. You've changed a research file. Where do you keep its history? (choose one) | Overlaps question 2; single choice |
| 4. When working on files with other people, what does that look like? (choose one) | Overlaps question 3; single choice |
| 5. Which AI tools do you use for your work? (optional short answer; helper text asks about access limits) | New |
| 6. How do you use AI for your work? (select all; adds "coordinating several agents" and "I don't use AI") | Overlaps question 4; adds two options |
| 7. Your code needs software packages. What's your approach? (choose one) | New |
| 8. What helps you check that your code works as intended? (choose one) | New |
| 9. You need to repeat a task with several steps. What sounds most like you? (choose one) | New |
| 10. What's your biggest day-to-day struggle with programming right now? (optional short answer) | Overlaps question 5 |

**Question for the RIKEN organiser:** Should RIKEN use the five SOKENDAI questions unchanged, the ten-question draft as written, or a merge? The draft's questions 1, 7, 8, and 9 are not in the SOKENDAI text. If the ten-question draft is chosen, RIKEN needs its own form and `surveyUrl`. Note that the existing text above says to tick all that apply and leave questions blank; the draft uses single choice with "Other".

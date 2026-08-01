# Stock Alert PoC 開発ルール

このファイルは、このリポジトリで作業する人間・AI向けの開発ルール正本です。新しい作業では、会話記憶より先にこのファイルと現行コードを確認してください。

## 1. 目的

Google Sheetsで設計した売買ラインと現在価格を結合し、各銘柄が次の有効ラインまでどれだけ近いかを一覧表示する個人用アプリを作ります。

このリポジトリは投資判断、銘柄選定、売買価格や数量の妥当性を検討する場所ではありません。それらは別の株関連プロジェクトで行います。

## 2. 最重要方針

- Google Sheets = 人間とAIが設計する売買ルールの正本
- 立花証券e支店API = 国内株の現在価格取得元
- Backend = Sheetsと株価を結合し、距離を計算する実行エンジン
- React Frontend = 到達状況を表示し、注文準備を支援する主画面
- DB = 将来の通知履歴、価格履歴、機械的状態のみ

アラート設計自体をDB正本へ移しません。

## 3. PoCの主役

主役はPush通知ではなく、**到達状況画面**です。

通知は将来、画面未確認、到達後未処理、監視停止などを知らせる補助機能として扱います。通知がなくても到達状況画面が使えればPoCは成立します。

## 4. PoCで検証する技術

1. 立花証券e支店APIから国内株の現在価格を取得できること
2. 現行Google Sheetsを読み取れること
3. 列追加・並び替えへ追従できるSheet Adapterを作れること
4. React + TypeScriptで画面を保守できること
5. React画面をAndroidアプリとして表示できること

## 5. Frontend方針

Frontendは以下を基本とします。

- React
- TypeScript
- Vite
- Capacitor

React Nativeは採用しません。ユーザーが通常のReactコードとして画面を保守できることを優先します。

Android固有機能はCapacitor Pluginまたは最小限のネイティブコードへ分離します。証券APIやGoogle Sheets APIをAndroidから直接呼びません。

既存のKotlin AndroidアプリはAPK配布とFCM受信を検証するための技術スパイクです。到達状況画面の最終実装基盤ではありません。

## 6. Google Sheets方針

まず現行シートを読めることを優先し、全面的なシート再設計を前提に作業を止めません。

ただし、コードを列番号へ固定してはいけません。

推奨構成:

- 実データシートに固定列識別子を持たせる
- 列定義シートに識別子、表示名、型、必須、説明、許容値を持たせる
- Backendは固定識別子を使って列位置を解決する
- Sheet Adapterで内部モデルへ変換する

変更時の挙動:

- 列の追加: 未使用列なら無視
- 列の並び替え: 自動追従
- 表示名変更: 固定識別子が同じなら影響なし
- 任意列削除: 欠損値として扱う
- 必須列削除: 読み込み停止して明示エラー
- 識別子重複: エラー
- 未知の識別子変更: 推測せずエラー

Spreadsheet IDや非公開シート名を公開リポジトリへ記載しません。

## 7. 立花証券API方針

- Backendだけが証券APIへアクセスする
- AndroidやReact Frontendへ認証情報を渡さない
- 監視銘柄は可能な限り一括取得する
- PoCでは常時監視や高頻度ポーリングをしない
- 画面表示時に現在価格を取得し、取得時刻を表示する
- ユーザー操作の連打防止は不要
- アプリ内部の意図しない二重ロードだけは発生させない

## 8. PoCの最小合格ライン

1銘柄について、Google Sheetsの有効ラインと立花証券APIの現在価格を結合し、React製Android画面へ以下を表示することです。

- 銘柄コード
- 銘柄名
- 現在価格
- 次の有効ライン種別
- 次の有効ライン価格
- 金額差
- 距離率
- 上方向、下方向、到達済みの区別
- 接近状態
- 現在価格の取得時刻

画面はまず文字主体で作ります。装飾的な価格線、チャート、本格デザインは検証後です。

## 9. 現在の状況

完了済み:

- Kotlin Android最小アプリ
- GitHub ActionsによるDebug APK生成
- GitHub ReleaseへのAPK公開
- Android端末でのインストールと起動確認
- Firebase / FCM Android実装
- FCM Registration token取得
- Firebase ConsoleからAndroid端末へのPush受信確認

実装済み・未検証:

- TypeScript BackendからFCMへテスト通知を送る処理

未実装:

- 立花証券e支店APIからの現在価格取得
- Google Sheets読み取り
- 固定列識別子とSheet Adapter
- 距離計算
- React Frontend
- Capacitor Android化

## 10. 実装順序

1. 立花証券e支店APIで国内株1銘柄の現在価格を取得
2. 現行Google Sheetsを読み取る
3. 固定列識別子とSheet Adapterを作る
4. React + TypeScript + ViteのFrontendを作る
5. 1銘柄分の到達状況をReact画面へ表示する
6. CapacitorでAndroidアプリとして表示する
7. 複数銘柄、並び替え、絞り込みを追加する
8. 必要になった時点でFCM通知を接続する

順番を飛ばして、本格UI、DB、WebSocket、注文連携を先に作りません。

## 11. Stage 1では実装しないもの

- DB
- WebSocket常時監視
- チャート
- 一般ニュース
- AIによる自動売買判断
- 完全自動発注
- 信用取引
- 空売り
- レバレッジ
- 一般公開向け機能

## 12. 技術方針

- BackendはTypeScript
- Backend実行環境はNode.js 22以上
- 初期クラウドはGCP
- Backend候補はCloud Run
- GCP上ではApplication Default Credentialsを優先する
- Google Sheets APIをBackendから使用する
- 設定は環境変数
- Secretをコードへ埋め込まない
- データプロバイダ依存は将来差し替え可能にする
- コンテナ化はDocker候補
- Infrastructure as CodeはTerraform候補

## 13. FCMの扱い

FCMは技術確認済みのオプション機能として残します。

- Android受信コードを削除しない
- Backendテスト送信コードを削除しない
- 現在のPoC必須条件にはしない
- 到達状況画面が完成してから、未確認警告などへ接続する
- Registration tokenやFirebase認証情報を公開リポジトリへ記載しない

## 14. Git運用

PoC期間中は `main` ブランチのみで運用します。

- 小さな変更は `main` へ直接反映してよい
- featureブランチやPR運用は現時点では不要
- Prettierはユーザーが明示した場合、または設定が存在する場合のみ実行する

## 15. 個人情報・秘密情報

公開リポジトリへ以下をコミットしません。

- 個人情報
- 個人端末の具体的な機種名
- 個人用Spreadsheet ID
- 非公開シート名
- APIキー
- Registration token
- 認証情報
- `google-services.json`
- サービスアカウント鍵

必要な値は環境変数またはSecretで管理します。

## 16. Repository Structure

```text
stock-alert-poc/
├─ backend/
├─ frontend/
├─ mobile/
├─ infrastructure/
├─ .github/
│  └─ workflows/
├─ AGENTS.md
└─ README.md
```

`frontend/` はReact + TypeScript + Vite、`mobile/` は現行Kotlin検証アプリから将来Capacitor Androidへ移行します。

## 17. 現在地

FCM受信までの通知技術検証は完了済みです。

現在は、立花証券API、Google Sheets、React到達状況画面をPoCの中心へ切り替えた段階です。次は立花証券APIで国内株1銘柄の現在価格を取得します。

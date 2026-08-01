# Stock Alert PoC 開発ルール

このファイルは、このリポジトリで作業する人間・AI向けの開発ルール正本です。新しい作業では、会話記憶より先にこのファイルと現行コードを確認してください。

## 1. 目的

Google Sheetsで設計した売買ラインと現在価格を結合し、各銘柄が次の有効ラインまでどれだけ近いかを一覧表示する個人用ツールを作ります。

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

## 4. 初期リリース形態

初期リリースはAndroidアプリではなく、React Web版とします。

理由:

- APKを画面変更ごとに再インストールしない
- PCとスマートフォンの両方で同じ画面を確認できる
- ユーザーが通常のReactコードとして保守できる
- Webで十分ならネイティブアプリ化を行わなくてよい

Webで不足する要件が判明した場合だけ、PWAまたはCapacitorによるAndroid化を検討します。React Nativeは採用しません。

## 5. PoCで検証する技術

1. React + TypeScriptで画面を継続保守できること
2. GitHub PagesでWeb版を迅速に公開・確認できること
3. TypeScript Backendから立花証券API形式のJSONを返せること
4. 現行Google Sheetsを読み取れること
5. 列追加・並び替えへ追従できるSheet Adapterを作れること
6. 立花証券e支店APIから国内株の現在価格を取得できること

立花証券APIの利用準備が完了するまでは、公開仕様に対応する固定レスポンスでFrontendとBackend間の通信を検証します。

## 6. Frontend方針

Frontendは以下を基本とします。

- React
- TypeScript
- Vite
- Recharts（価格線を実装する段階で追加）

初期画面はGitHub Pagesへ公開します。

React Frontendから証券APIやGoogle Sheets APIを直接呼びません。認証情報を必要とする処理はBackendに置きます。

現在の通信確認段階では、Backend応答を業務モデルへ変換せず、以下でそのまま表示します。

```tsx
JSON.stringify(tachibanaResponse, null, 2)
```

到達状況画面を実装する段階で、API応答から内部モデルへのAdapterを追加します。

## 7. 現在の最優先マイルストーン

Backendの `callTachibana()` が返す立花証券API形式の固定JSONを、React FrontendからHTTP経由で取得してそのまま表示することです。

```text
React Frontend
      ↓ GET /api/tachibana/market-price
TypeScript Backend
      ↓
callTachibana()
      ↓
CLMMfdsGetMarketPrice形式の固定レスポンス
```

この段階では以下を使用しません。

- Google Sheets
- 立花証券APIへの実通信
- 距離計算
- Recharts
- PWA
- Capacitor
- FCM

## 8. Google Sheets方針

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

## 9. 立花証券API方針

- Backendだけが証券APIへアクセスする
- FrontendやAndroidへ認証情報を渡さない
- 監視銘柄は可能な限り一括取得する
- PoCでは常時監視や高頻度ポーリングをしない
- 画面表示時に現在価格を取得し、取得時刻を表示する
- ユーザー操作の連打防止は不要
- アプリ内部の意図しない二重ロードだけは発生させない
- `callTachibana()` を実通信との交換境界にする
- 利用開始前はAPI仕様準拠の固定レスポンスを返す
- 口座準備完了後は `callTachibana()` の内部だけを実通信へ差し替える

現在の固定レスポンスは、公式 `CLMMfdsGetMarketPrice` の `sCLMID` と `aCLMMfdsMarketPrice` 構造に合わせます。

## 10. PoC全体の最小合格ライン

1銘柄について、Google Sheetsの有効ラインと現在価格を結合し、React Web画面へ以下を表示することです。

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

## 11. 現在の状況

完了済み:

- Kotlin Android最小アプリ
- GitHub ActionsによるDebug APK生成
- GitHub ReleaseへのAPK公開
- Android端末でのインストールと起動確認
- Firebase / FCM Android実装
- FCM Registration token取得
- Firebase ConsoleからAndroid端末へのPush受信確認
- React + TypeScript + Viteの最小Webページ
- GitHub Pagesへの自動公開workflow

実装済み・確認待ち:

- `callTachibana()` の固定レスポンス
- `GET /api/tachibana/market-price`
- FrontendからBackendへのfetch
- Backend応答の `JSON.stringify` 表示
- GitHub ActionsでのBackend・Frontendビルド

実装済み・未検証:

- TypeScript BackendからFCMへテスト通知を送る処理

未実装:

- BackendのCloud Run等への公開
- 立花証券e支店APIへの実接続
- Google Sheets読み取り
- 固定列識別子とSheet Adapter
- 到達状況への変換
- 距離計算と並び替え
- Recharts価格線

## 12. 実装順序

1. React WebのHello WorldをGitHub Pagesへ公開
2. Backendに立花証券API仕様準拠の固定レスポンスを実装
3. FrontendでBackend応答をそのまま表示
4. BackendをCloud Run等へ公開し、GitHub Pagesから接続
5. 口座準備完了後に実API通信へ差し替え
6. 現行Google Sheetsを読み取る
7. 固定列識別子とSheet Adapterを作る
8. Google Sheetsのラインと現在価格を結合する
9. 到達状況画面とRecharts価格線を作る
10. 必要になった時点で通知、PWA、Capacitorを検討する

順番を飛ばして、DB、WebSocket、注文連携、本格ネイティブアプリを先に作りません。

## 13. Stage 1では実装しないもの

- DB
- WebSocket常時監視
- 一般ニュース
- AIによる自動売買判断
- 完全自動発注
- 信用取引
- 空売り
- レバレッジ
- 一般公開向け機能

Rechartsによる価格線は、API通信経路を確認した後に追加します。

## 14. Backend・クラウド方針

- BackendはTypeScript
- Backend実行環境はNode.js 22以上
- HTTPサーバーは現時点ではNode.js標準 `node:http` を使用する
- 初期クラウドはGCP
- Backend候補はCloud Run
- GCP上ではApplication Default Credentialsを優先する
- Google Sheets APIをBackendから使用する
- 設定は環境変数
- Secretをコードへ埋め込まない
- データプロバイダ依存は差し替え可能にする
- コンテナ化はDocker候補
- Infrastructure as CodeはTerraform候補

HTTP Backendと立花API固定レスポンスは実装済みです。Cloud RunやTerraformによるGCP環境構築コードは未実装です。

## 15. 既存Android・FCMの扱い

既存のKotlin AndroidアプリとFCM実装は削除しません。

- Android受信コードを残す
- Firebase設定注入workflowを残す
- Backendテスト送信コードを残す
- 現在のPoC必須条件にはしない
- Web運用後に通知が必要になった時点で再利用する
- Registration tokenやFirebase認証情報を公開リポジトリへ記載しない

## 16. GitHub Pages方針

- `frontend/` または `backend/` の更新時にGitHub Actionsで両方をビルドする
- build成果物 `frontend/dist` をGitHub Pagesへ公開する
- GitHub Pagesの公開元はGitHub Actionsとする
- Viteのbaseは `/stock-alert-poc/` とする
- 公開Backend URLはRepository Variable `VITE_API_BASE_URL` でFrontendへ渡す
- `VITE_API_BASE_URL` 未設定時は `http://localhost:8080` を使用する
- 本物の売買ライン、認証情報、個人情報を静的Frontendへ含めない

GitHub Pages自体はBackendを実行できません。公開画面でAPI通信を確認するには、BackendをCloud Run等へ別途公開する必要があります。

## 17. Git運用

PoC期間中は `main` ブランチのみで運用します。

- 小さな変更は `main` へ直接反映してよい
- featureブランチやPR運用は現時点では不要
- Prettierはユーザーが明示した場合、または設定が存在する場合のみ実行する

## 18. 個人情報・秘密情報

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
- 実際の保有情報や非公開の売買ライン

必要な値は環境変数またはSecretで管理します。

## 19. Repository Structure

```text
stock-alert-poc/
├─ backend/
│  └─ src/
│     ├─ server.ts
│     ├─ sendTestNotification.ts
│     └─ tachibana/
├─ frontend/
├─ mobile/
├─ infrastructure/
├─ .github/
│  └─ workflows/
├─ AGENTS.md
└─ README.md
```

- `frontend/`: React + TypeScript + Vite Web
- `backend/`: TypeScript HTTP Backend、立花APIモック、FCM送信
- `mobile/`: Kotlin製FCM検証アプリ
- `infrastructure/`: 将来のGCP / Terraformコード

## 20. 現在地

FCM受信までの通知技術検証は完了済みです。

現在は、Backendの `callTachibana()` が返す固定JSONをReact Frontendへそのまま表示する通信経路を実装した段階です。次はGitHub Actionsのビルド確認、その後にBackendの公開方法を決めます。

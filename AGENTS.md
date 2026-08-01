# Stock Alert PoC 開発ルール

このファイルは、このリポジトリで作業する人間・AI向けの開発ルール正本です。新しい作業では、会話記憶より先にこのファイルと現行コードを確認してください。

## 1. 目的

Google Sheetsで設計した国内株の売買ラインと、立花証券e支店APIから取得する現在価格を結合し、各銘柄が次の有効ラインまでどれだけ近いかを表示する個人用PoCを作ります。

このリポジトリでは投資判断、銘柄選定、売買価格や数量の妥当性を検討しません。

## 2. 正本と責務

- Google Sheets: 売買設計の正本
- 立花証券e支店API: 国内株の現在価格取得元
- TypeScript Backend: Sheets取得、株価取得、結合、距離計算
- React Frontend: 到達状況の表示
- DB: 将来必要になった場合の通知履歴や機械的状態のみ

アラート設計自体をDB正本へ移しません。

## 3. PoCの主役

主役はPush通知ではなく、到達状況画面です。通知、PWA、Capacitor、Android化は、Web版で必要性が確認された後に検討します。

米国株の価格取得は現段階のPoC対象外です。

## 4. 現在の最優先マイルストーン

スプレッドシート由来のモック行から国内株コードを抽出し、そのコードを立花証券API形式の株価モックへ渡し、銘柄コードで結合したJSONをReact Frontendへ返します。

```text
getAlertSpreadsheet()
      ↓ symbol[]
callTachibana(symbols)
      ↓ CLMMfdsGetMarketPrice形式
getMainData()
      ↓ symbolで結合
GET /api/alert-statuses
      ↓
React Frontend
      ↓
JSON.stringify(response, null, 2)
```

現在は以下を実装済みです。

- `getAlertSpreadsheet()` の固定行配列
- 銘柄コード配列を受け取る `callTachibana(symbols)`
- アラート行と株価を結合する `getMainData()`
- `GET /api/alert-statuses`
- FrontendからBackendへのfetch
- `JSON.stringify` による応答表示

## 5. 現在のモック方針

`getAlertSpreadsheet()` は、Google Sheetsの1行に相当するオブジェクト配列を返します。現段階の必須項目は次の3つだけです。

```ts
{
  symbol: string
  name: string
  alertText: string
}
```

`callTachibana(symbols)` は、要求された銘柄に対応する固定株価を、公式 `CLMMfdsGetMarketPrice` の応答構造で返します。

固定値は通信経路と結合処理を確認するためのサンプルであり、実際の保有情報や売買設計を含めません。

## 6. Frontend方針

FrontendはReact、TypeScript、Viteを使用します。Rechartsは距離計算と価格線を実装する段階で追加します。

Frontendから証券APIやGoogle Sheets APIを直接呼びません。現在はBackendが返す結合済みJSONを加工せず表示します。

GitHub Pagesは静的配信です。公開画面からBackendへ接続する場合、BackendをCloud Run等へ別途公開し、Repository Variable `VITE_API_BASE_URL` でURLを渡します。未設定時は `http://localhost:8080` を使用します。

## 7. Google Sheets方針

Google Sheets実接続時は、全面再設計を前提に作業を止めません。ただし列番号へ直接依存してはいけません。

- 固定列識別子で列位置を解決する
- 表示名変更や列並び替えに追従する
- 未使用列は無視する
- 必須列欠損、識別子重複、未知の識別子変更は明示エラーにする
- Spreadsheet IDや非公開シート名を公開リポジトリへ記載しない

取得、文章解釈、内部モデル変換、距離計算は別責務として分離します。

## 8. 立花証券API方針

- Backendだけが立花証券APIへアクセスする
- FrontendやAndroidへ認証情報を渡さない
- 現在価格取得では監視銘柄を可能な限り一括要求する
- `callTachibana(symbols)` を実通信との交換境界にする
- PoCでは常時監視や高頻度ポーリングをしない
- 口座準備完了後に固定レスポンスを実通信へ差し替える
- 認証、セッション、エラー処理、120銘柄超の分割は実接続時に実装する

立花証券e支店APIは国内株用として扱います。

## 9. Backend方針

- TypeScript
- Node.js 22以上
- 現在のHTTPサーバーはNode.js標準 `node:http`
- 初期クラウド候補はGCP Cloud Run
- 設定は環境変数
- Secretをコードへ埋め込まない
- DB、WebSocket、注文連携を先回りして導入しない
- FCM送信コードは既存資産として保持する

## 10. 実装順序

1. React Webの最小ページをGitHub Pagesへ公開
2. 立花証券API形式の固定レスポンスを実装
3. スプレッドシート由来の固定行配列を実装
4. 銘柄コードを株価モックへ渡し、結果を結合してFrontendへ返す
5. BackendをCloud Run等へ公開し、GitHub Pagesから接続
6. 立花証券APIへ実接続
7. 現行Google Sheetsを読み取る
8. 固定列識別子とSheet Adapterを実装
9. 距離計算、並び替え、Recharts価格線を実装
10. 必要になった時点で通知、PWA、Capacitorを検討

順番を飛ばして、本格的な認証基盤、DB、WebSocket、自動発注、一般公開向け機能を作りません。

## 11. PoC全体の最小合格ライン

1銘柄について、Google Sheetsの有効ラインと現在価格を結合し、React Web画面へ次を表示できることです。

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

## 12. 既存Android・FCMの扱い

既存のKotlin Androidアプリ、Firebase設定注入workflow、FCM受信コード、BackendのFCM送信コードは削除しません。ただし現在のPoC必須条件には含めません。

Registration token、Firebase認証情報、`google-services.json` を公開リポジトリへ記載しません。

## 13. GitHub PagesとCI

- `frontend/` または `backend/` の更新時にGitHub Actionsで両方をビルドする
- `frontend/dist` をGitHub Pagesへ公開する
- GitHub Pagesの公開元はGitHub Actionsとする
- Viteのbaseは `/stock-alert-poc/` とする
- Pages上でBackendは動作しない

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
- 実際の保有情報や非公開の売買ライン

必要な値は環境変数またはSecretで管理します。

## 16. Repository Structure

```text
stock-alert-poc/
├─ backend/
│  └─ src/
│     ├─ alerts/
│     ├─ main/
│     └─ tachibana/
├─ frontend/
├─ mobile/
├─ infrastructure/
├─ .github/workflows/
├─ AGENTS.md
└─ README.md
```

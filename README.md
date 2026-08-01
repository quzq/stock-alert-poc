# Stock Alert PoC

[**GitHub PagesでReact Web版を開く**](https://quzq.github.io/stock-alert-poc/)

Google Sheetsで設計した売買ラインと現在価格を結合し、各銘柄が次の有効ラインまでどれだけ近いかを一覧表示する個人用PoCです。

このリポジトリは投資判断そのものを行う場所ではありません。売買計画に対する現在価格の位置を可視化し、到達前の注文準備を支援するアプリケーション基盤を検証します。

## 現在のWeb画面

React FrontendからTypeScript Backendを呼び、スプレッドシート由来のモックと立花証券API形式の株価モックを銘柄コードで結合したJSONを表示します。

```text
getAlertSpreadsheet()
   ↓ アラート行から銘柄コードを抽出
callTachibana(symbols)
   ↓ 立花証券API形式の株価モック
getMainData()
   ↓ symbolで結合
GET /api/alert-statuses
   ↓
React Frontend
   ↓
JSON.stringify(response, null, 2)
```

GitHub Pagesは静的配信のため、公開画面からBackendへ接続するにはBackendの公開URLが別途必要です。GitHub ActionsではRepository Variable `VITE_API_BASE_URL` をFrontendのビルド時に使用します。未設定時は `http://localhost:8080` を使用します。

## 現在のモック

`getAlertSpreadsheet()` は、実際のGoogle Sheetsへ接続せず、銘柄コード、銘柄名、アラート文を含む固定の行配列を返します。

`callTachibana(symbols)` は、受け取った銘柄コードに対応する固定株価を、公式 `CLMMfdsGetMarketPrice` の応答構造に合わせて返します。

```json
[
  {
    "symbol": "5367",
    "name": "ニッカトー",
    "alertText": "1,200円で確認（モック）",
    "marketPrice": {
      "sIssueCode": "5367",
      "pDPP": "1255",
      "pPRP": "1240",
      "tDPP:T": "153000"
    }
  }
]
```

固定値は通信経路と結合処理を検証するためのサンプルであり、実際の売買設計ではありません。

## PoCの主役

主役はPush通知ではなく、**到達状況画面**です。

```text
Google Sheetsの売買ライン・状態
        ＋
立花証券e支店APIの現在価格
        ↓
次の有効ラインと距離を計算
        ↓
React製の到達状況画面
```

通知は、画面未確認や到達後未処理を知らせる将来オプションです。

## 技術検証

PoCで検証する中心項目は次の3つです。

1. React + TypeScriptで到達状況画面を作り、Webで継続運用・保守できること
2. 現行Google Sheetsを読み取り、列追加・並び替えに追従できること
3. 立花証券e支店APIから国内株の現在価格を取得できること

Google Sheetsは売買設計の正本とします。列番号へ直接依存せず、固定識別子とSheet Adapterを通して内部モデルへ変換します。

米国株の価格取得は本PoCの対象外です。

## Frontend方針

到達状況画面は以下で実装します。

- React
- TypeScript
- Vite
- Recharts（価格線を実装する段階で追加）

最初はWebとして公開・運用します。Webで不足する要件が判明した場合だけ、PWAまたはCapacitorによるAndroid化を検討します。React Nativeは採用しません。

## 現在の状況

完了済み:

- Kotlinによる最小Androidアプリ
- GitHub ActionsによるDebug APK生成
- GitHub ReleaseへのAPK公開
- Android端末でのインストール・起動確認
- Firebase設定
- FCM Registration token取得
- Firebase ConsoleからAndroid端末へのPush受信確認
- React + TypeScript + Viteの最小Web画面
- GitHub Pagesへの自動公開workflow
- `getAlertSpreadsheet()` の固定行配列
- 銘柄コードを引数に取る `callTachibana(symbols)`
- アラート行と株価を結合する `getMainData()`
- `GET /api/alert-statuses`
- Frontendでの `JSON.stringify` 表示

実装済み・確認待ち:

- GitHub ActionsでのBackend・Frontendビルド
- ローカル環境でのFrontendからBackendへの通信

実装済み・未検証:

- TypeScript BackendからFCMへテスト通知を送る処理

未実装:

- BackendのCloud Run等への公開
- 立花証券e支店APIへの実接続
- Google Sheets読み取り
- 固定列識別子とSheet Adapter
- 実データに基づく到達状況への変換
- 距離計算と並び替え
- Rechartsによる価格線

## 現在の合格ライン

ローカル環境でFrontendから `GET /api/alert-statuses` を呼び、スプレッドシート由来のモック行と立花証券API形式の株価モックが銘柄コードで結合されたJSONを表示できることです。

公開GitHub Pagesで同じ確認を行うには、Backendを公開した後にRepository Variable `VITE_API_BASE_URL` へそのURLを設定します。

## PoC全体の最小合格ライン

1銘柄について、以下がReact Web画面へ表示されることです。

```text
銘柄コード・銘柄名
現在価格
次の有効な購入・追加・売却ライン
ラインまでの金額差
ラインまでの距離率
方向と接近状態
価格取得時刻
```

## 実装順序

1. React WebのHello WorldをGitHub Pagesへ公開
2. Backendに立花証券API仕様準拠の固定レスポンスを実装
3. スプレッドシート由来の固定行配列を実装
4. 銘柄コードを立花モックへ渡し、結果を結合してFrontendへ返す
5. BackendをCloud Run等へ公開し、GitHub Pagesから接続
6. 口座準備完了後に実API通信へ差し替え
7. 現行Google Sheetsを読み取る
8. 固定列識別子とSheet Adapterを作る
9. 到達状況計算とRecharts価格線を作る
10. 必要になった時点で通知またはアプリ化を検討する

## 既存Android・通知実装

既存の `mobile/`、Firebase設定、FCM受信コード、BackendのFCM送信コードは削除しません。

これらは通知技術の検証済み資産として保持しますが、現在のPoC必須条件ではありません。

[**技術検証用Android APKをダウンロード**](https://github.com/quzq/stock-alert-poc/releases/download/poc-latest/app-debug.apk)

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontendを別のターミナルで起動:

```bash
cd frontend
npm install
npm run dev
```

Backendの標準URLは `http://localhost:8080`、Frontendの標準URLは `http://localhost:5173` です。

別のBackendへ接続する場合:

```bash
VITE_API_BASE_URL=https://example-backend.run.app npm run dev
```

Production build:

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

## Repository Structure

```text
stock-alert-poc/
├─ backend/          # TypeScript Backend、アラートモック、立花APIモック、FCM送信
├─ frontend/         # React + TypeScript + Vite Web
├─ mobile/           # Kotlin製FCM検証アプリ
├─ infrastructure/   # GCP / Terraform等
├─ .github/
│  └─ workflows/
├─ AGENTS.md
└─ README.md
```

## Development Policy

- 最小の成功条件だけを先に通す
- 初期リリースはReact Webとする
- Google Sheetsを売買設計の正本として維持する
- シート列番号をコードへ固定しない
- Backend以外から証券APIやGoogle Sheets APIへ直接アクセスしない
- FCM通知とネイティブアプリ化をPoCの必須条件にしない
- DBを先回りして導入しない
- PoC期間中は `main` ブランチのみで運用する
- 公開リポジトリに個人情報、個人端末情報、非公開ID、認証情報を記載しない

詳細な開発ルールは [`AGENTS.md`](./AGENTS.md) を参照してください。

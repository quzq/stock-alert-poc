# Stock Alert PoC

[**GitHub PagesでReact Web版を開く**](https://quzq.github.io/stock-alert-poc/)

Google Sheetsで設計した売買ラインと現在価格を結合し、各銘柄が次の有効ラインまでどれだけ近いかを一覧表示する個人用PoCです。

このリポジトリは投資判断そのものを行う場所ではありません。売買計画に対する現在価格の位置を可視化し、到達前の注文準備を支援するアプリケーション基盤を検証します。

## React Web

初期リリースはAndroidアプリではなく、React Web版を使用します。

`main` の `frontend/` が更新されると、GitHub ActionsでビルドしてGitHub Pagesへ公開します。

現在のWeb画面は、ReactとGitHub Pagesの公開経路を確認するためのHello World相当です。

```text
Stock Alert PoC
React Web build successful
```

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

立花証券APIの利用準備が完了するまでは、公開仕様に合わせたMock Providerで画面開発を進めます。

Google Sheetsは売買設計の正本とします。列番号へ直接依存せず、固定識別子とSheet Adapterを通して内部モデルへ変換します。

## Frontend方針

到達状況画面は以下で実装します。

- React
- TypeScript
- Vite
- Recharts（価格線を実装する段階で追加）

最初はWebとして公開・運用します。Webで不足する要件が判明した場合だけ、PWAまたはCapacitorによるAndroid化を検討します。React Nativeは採用しません。

Backend、Google Sheets、立花証券APIへ接続する前に、静的なモックデータで到達状況画面の使いやすさを確認します。

## 現在の状況

完了済み:

- Kotlinによる最小Androidアプリ
- GitHub ActionsによるDebug APK生成
- GitHub ReleaseへのAPK公開
- Android端末でのインストール・起動確認
- Firebase設定
- FCM Registration token取得
- Firebase ConsoleからAndroid端末へのPush受信確認

実装済み・確認待ち:

- React + TypeScript + Viteの最小Web画面
- GitHub Pagesへの自動公開workflow

実装済み・未検証:

- TypeScript BackendからFCMへテスト通知を送る処理

未実装:

- モックデータによる到達状況画面
- Rechartsによる価格線
- Google Sheets読み取り
- 固定列識別子とSheet Adapter
- 立花証券e支店APIからの現在価格取得
- 距離計算と並び替え

## 現在の合格ライン

`main` へpushするとGitHub Pagesが更新され、PCまたはスマートフォンのブラウザでReactの最小ページを確認できることです。

次の段階では、架空データだけを使用して1銘柄分の到達状況を表示します。Google Sheets、立花証券API、認証情報はまだ使用しません。

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
2. 静的モックデータで1銘柄の到達状況画面を作る
3. Rechartsで価格線を表示する
4. 複数銘柄・並び替え・スマートフォン表示を検証する
5. 現行Google Sheetsを読み取る
6. 固定列識別子とSheet Adapterを作る
7. 立花証券API仕様に対応するMock Providerを作る
8. 口座準備完了後に実API Providerへ差し替える
9. Google Sheetsのラインと現在価格を結合する
10. 必要になった時点で通知またはアプリ化を検討する

## 既存Android・通知実装

既存の `mobile/`、Firebase設定、FCM受信コード、BackendのFCM送信コードは削除しません。

これらは通知技術の検証済み資産として保持しますが、現在のPoC必須条件ではありません。

[**技術検証用Android APKをダウンロード**](https://github.com/quzq/stock-alert-poc/releases/download/poc-latest/app-debug.apk)

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Repository Structure

```text
stock-alert-poc/
├─ backend/          # TypeScript Backend
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

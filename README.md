# Stock Alert PoC

Google Sheetsで設計した売買ラインと現在価格を結合し、各銘柄が次の有効ラインまでどれだけ近いかを一覧表示する個人用PoCです。

このリポジトリは投資判断そのものを行う場所ではありません。売買計画に対する現在価格の位置を可視化し、到達前の注文準備を支援するアプリケーション基盤を検証します。

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

1. 立花証券e支店APIから国内株の現在価格を取得できること
2. 現行Google Sheetsを読み取り、列追加・並び替えに追従できること
3. React + TypeScriptで到達状況画面を作り、Androidアプリとして表示・保守できること

Google Sheetsは売買設計の正本とします。列番号へ直接依存せず、固定識別子とSheet Adapterを通して内部モデルへ変換します。

## Frontend方針

到達状況画面は以下で実装します。

- React
- TypeScript
- Vite
- Capacitor

通常のReactコードを中心に保ち、Android固有機能だけをCapacitor Pluginまたは最小ネイティブコードへ分離します。React Nativeは採用しません。

既存のKotlin Androidアプリは、APK配布とFCM受信を確認するための技術検証用です。最終的な到達状況画面の実装基盤ではありません。

## 現在の状況

完了済み:

- Kotlinによる最小Androidアプリ
- GitHub ActionsによるDebug APK生成
- GitHub ReleaseへのAPK公開
- Android端末でのインストール・起動確認
- Firebase設定
- FCM Registration token取得
- Firebase ConsoleからAndroid端末へのPush受信確認

実装済み・未検証:

- TypeScript BackendからFCMへテスト通知を送る処理

未実装:

- 立花証券e支店APIからの現在価格取得
- Google Sheets読み取り
- 固定列識別子とSheet Adapter
- 距離計算
- React到達状況画面
- CapacitorによるAndroid化

## PoCの最小合格ライン

1銘柄について、以下がAndroid端末のReact画面へ表示されることです。

```text
銘柄コード・銘柄名
現在価格
次の有効な購入・追加・売却ライン
ラインまでの金額差
ラインまでの距離率
方向と接近状態
価格取得時刻
```

画面は最初から装飾的な価格線にせず、文字主体の一覧で検証します。

## 実装順序

1. 立花証券e支店APIで国内株1銘柄の現在価格を取得
2. 現行Google Sheetsを読み取る
3. 列追加・並び替えに耐える固定識別子とSheet Adapterを作る
4. React + TypeScript + ViteのFrontendを作る
5. 1銘柄分を結合し、次の有効ラインと距離を画面表示
6. CapacitorでAndroidアプリとして表示
7. 複数銘柄・並び替え・絞り込み
8. 必要に応じてFCM通知を接続

Google Sheetsの全面ブラッシュアップを待たず、まず現行シートを読めることを優先します。

## Android APK

現在の技術検証用Debug APKは以下から取得できます。

[**最新APKをダウンロード**](https://github.com/quzq/stock-alert-poc/releases/download/poc-latest/app-debug.apk)

現時点のAPKはKotlin製のFCM検証アプリです。React + Capacitor移行後にビルド対象を切り替えます。

## Repository Structure

```text
stock-alert-poc/
├─ backend/          # TypeScript Backend
├─ frontend/         # React + TypeScript + Vite
├─ mobile/           # 現行Kotlin検証アプリ。将来Capacitor Androidへ移行
├─ infrastructure/   # GCP / Terraform等
├─ .github/
│  └─ workflows/
├─ AGENTS.md
└─ README.md
```

## Development Policy

- 最小の成功条件だけを先に通す
- Google Sheetsを売買設計の正本として維持する
- シート列番号をコードへ固定しない
- Backend以外から証券APIへ直接アクセスしない
- 到達状況画面はReactで保守できる構成にする
- FCM通知をPoCの必須条件にしない
- DBを先回りして導入しない
- PoC期間中は `main` ブランチのみで運用する
- 公開リポジトリに個人情報、個人端末情報、非公開ID、認証情報を記載しない

詳細な開発ルールは [`AGENTS.md`](./AGENTS.md) を参照してください。
